import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Terminal, Search, Filter, Trash2, Pause, Play, Database, Bot } from 'lucide-react';
import { format } from 'date-fns';

const socket = io('http://localhost:4000');

type LogEntry = {
  id: string;
  service: string;
  level: string;
  message: string;
  timestamp: string;
  data?: any;
};

const serviceColors: Record<string, string> = {
  'skeeme-go': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'ai-service': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const serviceIcons: Record<string, React.ReactNode> = {
  'skeeme-go': <Database className="w-4 h-4 mr-1" />,
  'ai-service': <Bot className="w-4 h-4 mr-1" />,
};

const levelColors: Record<string, string> = {
  'info': 'text-zinc-400',
  'error': 'text-red-400 font-medium',
  'warn': 'text-yellow-400',
  'success': 'text-emerald-400',
};

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [search, setSearch] = useState('');
  const [filterService, setFilterService] = useState<string>('all');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    socket.on('init_logs', (initialLogs: LogEntry[]) => {
      setLogs(initialLogs);
      scrollToBottom();
    });

    socket.on('new_log', (log: LogEntry) => {
      if (!isPausedRef.current) {
        setLogs((prev) => {
          const updated = [...prev, log];
          return updated.length > 1000 ? updated.slice(-1000) : updated;
        });
      }
    });

    return () => {
      socket.off('init_logs');
      socket.off('new_log');
    };
  }, []);

  useEffect(() => {
    if (!isPaused) {
      scrollToBottom();
    }
  }, [logs, isPaused]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearLogs = () => setLogs([]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase()) || 
                          (log.data && JSON.stringify(log.data).toLowerCase().includes(search.toLowerCase()));
    const matchesService = filterService === 'all' || log.service === filterService;
    return matchesSearch && matchesService;
  });

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-300 font-mono text-sm">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Terminal className="w-5 h-5 text-emerald-400" />
          </div>
          <h1 className="text-lg font-semibold text-zinc-100">Skeeme Logs Dashboard</h1>
          <span className="flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Connected
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:border-zinc-700 text-sm w-64 transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="pl-9 pr-8 py-1.5 bg-zinc-950 border border-zinc-800 rounded-md focus:outline-none focus:border-zinc-700 text-sm appearance-none cursor-pointer"
            >
              <option value="all">All Services</option>
              <option value="skeeme-go">skeeme-go</option>
              <option value="ai-service">ai-service</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 border-l border-zinc-800 pl-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-1.5 rounded-md border transition-colors ${
                isPaused 
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' 
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
              }`}
              title={isPaused ? "Resume auto-scroll" : "Pause auto-scroll"}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={clearLogs}
              className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Log Viewer */}
      <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-zinc-600">
              No logs matched your criteria
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="group flex items-start p-2.5 rounded hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-800"
              >
                <div className="flex-shrink-0 w-24 text-zinc-500 text-xs mt-0.5">
                  {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                </div>
                
                <div className="flex-shrink-0 w-32 mr-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${serviceColors[log.service] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                    {serviceIcons[log.service]}
                    {log.service}
                  </span>
                </div>

                <div className={`flex-1 break-all ${levelColors[log.level] || 'text-zinc-300'}`}>
                  <span className="font-semibold mr-2 opacity-50 uppercase text-xs">[{log.level}]</span>
                  {log.message}
                  
                  {log.data && Object.keys(log.data).length > 0 && (
                    <pre className="mt-2 p-2 bg-zinc-950 rounded border border-zinc-800 text-xs text-zinc-400 overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </main>
    </div>
  );
}
