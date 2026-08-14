import http from 'http';

const INGEST_URL = 'http://localhost:4000/ingest';

function sendLog(level: string, args: any[]) {
  const message = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');

  const entry = {
    service: 'ai-service',
    level,
    message,
    timestamp: new Date().toISOString()
  };

  const payload = JSON.stringify(entry);

  const req = http.request(INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 2000
  });

  req.on('error', () => {
    // Ignore errors so we don't crash the main app if the logger is down
  });

  req.write(payload);
  req.end();
}

// Override console methods
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;
const originalInfo = console.info;

console.log = function(...args) {
  originalLog.apply(console, args);
  sendLog('info', args);
};

console.info = function(...args) {
  originalInfo.apply(console, args);
  sendLog('info', args);
};

console.warn = function(...args) {
  originalWarn.apply(console, args);
  sendLog('warn', args);
};

console.error = function(...args) {
  originalError.apply(console, args);
  sendLog('error', args);
};

export const initLogger = () => {
  // Call this once to trigger the overrides
};
