@extends('team.layout')

@section('team-content')
<div class="admin-page">
    <div class="page-header">
        <h1>Analytics Dashboard</h1>
        <p class="page-subtitle">View system analytics and user activity metrics</p>
    </div>

    <!-- Time Period Selector -->
    <div class="filter-section">
        <div class="filter-row">
            <button class="period-btn active" onclick="changePeriod('week')">Last 7 Days</button>
            <button class="period-btn" onclick="changePeriod('month')">Last 30 Days</button>
            <button class="period-btn" onclick="changePeriod('quarter')">Last Quarter</button>
            <button class="period-btn" onclick="changePeriod('year')">Last Year</button>
        </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-label">User Signups</span>
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            </div>
            <div class="kpi-value">{{ number_format($signups) }}</div>
            <div class="kpi-change {{ $signupChange >= 0 ? 'positive' : 'negative' }}">{{ $signupChange >= 0 ? '↑' : '↓' }} {{ abs($signupChange) }}% from last period</div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-label">Active Users</span>
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                </svg>
            </div>
            <div class="kpi-value">{{ number_format($activeUsers) }}</div>
            <div class="kpi-change positive">↑ {{ $activeUsersChange }}% from last period</div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-label">Conversion Rate</span>
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="12 7 19 12 12 17"></polyline>
                    <polyline points="19 12 5 12"></polyline>
                </svg>
            </div>
            <div class="kpi-value">{{ number_format($conversionRate, 1) }}%</div>
            <div class="kpi-change positive">↑ 3.2% from last period</div>
        </div>
        
        <div class="kpi-card">
            <div class="kpi-header">
                <span class="kpi-label">Revenue</span>
                <svg class="kpi-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6"></path>
                    <path d="M9 11h6"></path>
                </svg>
            </div>
            <div class="kpi-value">${{ number_format($totalRevenue, 2) }}</div>
            <div class="kpi-change {{ $revenueChange >= 0 ? 'positive' : 'negative' }}">{{ $revenueChange >= 0 ? '↑' : '↓' }} {{ abs($revenueChange) }}% from last period</div>
        </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
        <div class="chart-card">
            <h3 class="chart-title">User Signups Trend</h3>
            <canvas id="signupsChart" height="80"></canvas>
        </div>
        
        <div class="chart-card">
            <h3 class="chart-title">Revenue Trend</h3>
            <canvas id="revenueChart" height="80"></canvas>
        </div>
    </div>

    <div class="charts-grid">
        <div class="chart-card">
            <h3 class="chart-title">User Activity by Day</h3>
            <canvas id="activityChart" height="80"></canvas>
        </div>
        
        <div class="chart-card">
            <h3 class="chart-title">Plan Distribution</h3>
            <canvas id="plansChart" height="80"></canvas>
        </div>
    </div>

    <!-- Export Section -->
    <div class="export-section">
        <h3>Export Data</h3>
        <div class="export-buttons">
            <button class="btn btn-primary" onclick="exportData('csv')">Export as CSV</button>
            <button class="btn btn-primary" onclick="exportData('excel')">Export as Excel</button>
            <button class="btn btn-primary" onclick="exportData('pdf')">Export as PDF</button>
        </div>
    </div>

    <a href="{{ route('team.dashboard') }}" class="btn btn-secondary" style="margin-top: 30px;">Back to Dashboard</a>
</div>

<style>
    .admin-page { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .page-header { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #334155; }
    .page-header h1 { margin: 0; font-size: 28px; font-weight: 700; color: #f1f5f9; }
    .page-subtitle { margin: 8px 0 0; color: #cbd5e1; font-size: 14px; }

    .filter-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; margin-bottom: 24px; }
    .filter-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .period-btn { padding: 8px 16px; border: 1px solid #334155; background: #0f172a; color: #cbd5e1; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.3s; }
    .period-btn:hover { border-color: #60a5fa; color: #60a5fa; }
    .period-btn.active { background: #60a5fa; color: white; border-color: #60a5fa; }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; }
    .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .kpi-label { font-size: 12px; color: #cbd5e1; font-weight: 500; }
    .kpi-icon { color: #60a5fa; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
    .kpi-change { font-size: 11px; font-weight: 600; }
    .kpi-change.positive { color: #86efac; }
    .kpi-change.negative { color: #fca5a5; }

    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .chart-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; }
    .chart-title { margin: 0 0 20px; font-size: 14px; font-weight: 600; color: #f1f5f9; }

    .export-section { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 20px; }
    .export-section h3 { margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #f1f5f9; }
    .export-buttons { display: flex; gap: 10px; flex-wrap: wrap; }

    .btn { padding: 8px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 500; transition: all 0.3s; }
    .btn-primary { background: #60a5fa; color: white; }
    .btn-primary:hover { background: #3b82f6; }
    .btn-secondary { background: #475569; color: white; }
    .btn-secondary:hover { background: #64748b; }

    @media (max-width: 768px) {
        .charts-grid { grid-template-columns: 1fr; }
    }
</style>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    let signupsChartInstance, revenueChartInstance, activityChartInstance, plansChartInstance;

    function changePeriod(period) {
        document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        loadCharts(period);
    }

    function initCharts() {
        // Signups Chart
        const signupsCtx = document.getElementById('signupsChart').getContext('2d');
        signupsChartInstance = new Chart(signupsCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Signups',
                    data: [45, 52, 48, 61, 55, 67, 45],
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#60a5fa',
                    pointBorderColor: '#0f172a',
                    pointBorderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                        grid: { color: '#334155' }
                    },
                    x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#334155' } }
                }
            }
        });

        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        revenueChartInstance = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Revenue',
                    data: [4200, 5100, 4800, 6200, 5500, 7100, 5800],
                    borderColor: '#34d399',
                    backgroundColor: 'rgba(52, 211, 153, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#34d399',
                    pointBorderColor: '#0f172a',
                    pointBorderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                        grid: { color: '#334155' }
                    },
                    x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#334155' } }
                }
            }
        });

        // Activity Chart
        const activityCtx = document.getElementById('activityChart').getContext('2d');
        activityChartInstance = new Chart(activityCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Active Users',
                    data: [240, 290, 220, 310, 270, 180, 120],
                    backgroundColor: '#f59e0b',
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                        grid: { color: '#334155' }
                    },
                    x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { color: '#334155' } }
                }
            }
        });

        // Plans Distribution Chart
        const plansCtx = document.getElementById('plansChart').getContext('2d');
        plansChartInstance = new Chart(plansCtx, {
            type: 'doughnut',
            data: {
                labels: ['Free', 'Basic', 'Pro', 'Enterprise'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#60a5fa', '#34d399', '#f59e0b', '#ef4444'],
                    borderColor: '#1e293b',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#cbd5e1', font: { size: 11 } }
                    }
                }
            }
        });
    }

    function loadCharts(period) {
        console.log('Loading charts for period:', period);
    }

    function exportData(format) {
        alert('Exporting analytics data as ' + format.toUpperCase());
    }

    window.addEventListener('DOMContentLoaded', initCharts);
</script>
@endsection
