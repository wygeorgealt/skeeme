<x-filament-panels::page>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <x-filament::card>
            <div class="flex flex-col gap-1">
                <span class="text-sm font-medium text-gray-500">Total DB Size</span>
                <span class="text-3xl font-bold">{{ $this->getDatabaseSize() }}</span>
            </div>
        </x-filament::card>
    </div>

    <div class="mt-8">
        <h3 class="text-lg font-bold mb-4">Table Breakdown</h3>
        <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="px-6 py-4 font-bold text-gray-900 dark:text-white">Table Name</th>
                        <th class="px-6 py-4 font-bold text-gray-900 dark:text-white text-right">Records</th>
                        <th class="px-6 py-4 font-bold text-gray-900 dark:text-white text-right">Disk Size</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                    @foreach ($this->getTableStats() as $stat)
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td class="px-6 py-4 font-mono text-indigo-600 dark:text-indigo-400">{{ $stat['name'] }}</td>
                            <td class="px-6 py-4 text-right font-medium">{{ number_format($stat['count']) }}</td>
                            <td class="px-6 py-4 text-right text-gray-500">{{ $stat['size'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</x-filament-panels::page>
