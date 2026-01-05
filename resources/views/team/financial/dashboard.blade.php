@extends('team.layout')

@section('team-content')
<div class="admin-page">
    <div class="page-header">
        <h1><i class="fas fa-money-bill-wave"></i> Financial Management Dashboard</h1>
        <p class="page-subtitle">Manage revenue, refunds, invoices, and financial reports</p>
    </div>

    <!-- Financial Overview Cards -->
    <div class="metrics-row">
        <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-dollar-sign"></i></div>
            <div class="metric-content">
                <div class="metric-label">Revenue This Month</div>
                <div class="metric-value">${{ number_format($revenue_this_month, 0) }}</div>
                <div class="metric-detail">+{{ round((($revenue_this_month - $revenue_last_month) / $revenue_last_month * 100), 1) }}% vs last month</div>
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-undo"></i></div>
            <div class="metric-content">
                <div class="metric-label">Total Refunds</div>
                <div class="metric-value">${{ number_format($total_refunds, 0) }}</div>
                <div class="metric-detail">{{ round(($total_refunds / $revenue_this_month * 100), 2) }}% of revenue</div>
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-file-invoice"></i></div>
            <div class="metric-content">
                <div class="metric-label">Pending Invoices</div>
                <div class="metric-value">{{ $pending_invoices }}</div>
                <div class="metric-detail">Awaiting payment</div>
            </div>
        </div>
        <div class="metric-card">
            <div class="metric-icon"><i class="fas fa-credit-card"></i></div>
            <div class="metric-content">
                <div class="metric-label">Failed Payments</div>
                <div class="metric-value">{{ $failed_payments }}</div>
                <div class="metric-detail">Require attention</div>
            </div>
        </div>
    </div>

    <!-- Financial Actions -->
    <div class="admin-sections" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
        <a href="#" class="admin-card action-card">
            <div class="card-header">
                <h3><i class="fas fa-undo"></i> Process Refunds</h3>
            </div>
            <div class="card-content">
                <p>Handle customer refunds and reversals</p>
                <button class="btn btn-primary">Process Refund</button>
            </div>
        </a>

        <a href="#" class="admin-card action-card">
            <div class="card-header">
                <h3><i class="fas fa-file-invoice"></i> View Invoices</h3>
            </div>
            <div class="card-content">
                <p>Manage and download all invoices</p>
                <button class="btn btn-primary">View Invoices</button>
            </div>
        </a>

        <a href="#" class="admin-card action-card">
            <div class="card-header">
                <h3><i class="fas fa-tag"></i> Discount Codes</h3>
            </div>
            <div class="card-content">
                <p>Create and manage promotion codes</p>
                <button class="btn btn-primary">Create Discount</button>
            </div>
        </a>

        <a href="#" class="admin-card action-card">
            <div class="card-header">
                <h3><i class="fas fa-file-pdf"></i> Financial Reports</h3>
            </div>
            <div class="card-content">
                <p>Export detailed financial reports</p>
                <button class="btn btn-primary">Generate Report</button>
            </div>
        </a>
    </div>
</div>

<style>
    .admin-page {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
    }

    .page-header {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #334155;
    }

    .page-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        color: #f1f5f9;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .page-header h1 i {
        color: #60a5fa;
    }

    .page-subtitle {
        margin: 8px 0 0;
        color: #cbd5e1;
        font-size: 14px;
    }

    .metrics-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
    }

    .metric-card {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }

    .metric-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
        transform: translateY(-4px);
    }

    .metric-icon {
        font-size: 40px;
        color: #60a5fa;
        opacity: 0.9;
    }

    .metric-content {
        flex: 1;
    }

    .metric-label {
        font-size: 12px;
        color: #94a3b8;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .metric-value {
        font-size: 28px;
        font-weight: 700;
        color: #f1f5f9;
        margin: 4px 0;
    }

    .metric-detail {
        font-size: 12px;
        color: #cbd5e1;
    }

    .admin-sections {
        display: grid;
        gap: 20px;
        margin-bottom: 30px;
    }

    .admin-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        text-decoration: none;
        display: flex;
        flex-direction: column;
    }

    .admin-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15);
        transform: translateY(-4px);
    }

    .card-header {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
        padding: 18px 20px;
        border-bottom: 1px solid #334155;
    }

    .card-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #f1f5f9;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .card-header h3 i {
        font-size: 18px;
        color: #60a5fa;
    }

    .card-content {
        padding: 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .card-content p {
        color: #cbd5e1;
        font-size: 13px;
        margin: 0 0 15px 0;
        flex: 1;
    }

    .btn {
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #334155;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .btn-primary {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
    }

    .btn-primary:hover {
        background: #2563eb;
        border-color: #2563eb;
    }
</style>
@endsection
