# Phase 2 & 3 Implementation Guide

## Overview

Phase 2 and Phase 3 features have been fully implemented and integrated into the Company/Team Management Dashboard. These features provide comprehensive communication, monitoring, and AI management capabilities for the system administrators.

---

## Phase 2: Communication & Support

### 2.1 System Announcements (Separate from School Announcements)

**Table:** `system_announcements` (renamed from `announcements` to avoid conflicts with school announcements)

**Model:** `SystemAnnouncement`

**Features:**
- Create system-wide announcements for schools, teachers, students, or custom targets
- Support for multiple announcement types: info, warning, success, critical
- Pin important announcements to top of feed
- Set expiration dates for time-limited announcements
- Track view counts and engagement
- Publish immediately or schedule for later
- Target specific schools or all schools

**Controller Methods:**
- `index()` - List all announcements
- `announcements()` - Manage announcements with filtering
- `createAnnouncement()` - Show creation form
- `storeAnnouncement()` - Create new announcement
- `editAnnouncement()` - Edit existing announcement
- `updateAnnouncement()` - Update announcement details
- `publishAnnouncement()` - Publish scheduled announcement
- `deleteAnnouncement()` - Delete announcement (soft delete via is_active flag)

**Routes:**
```
GET  /work/communications                      - Dashboard
GET  /work/communications/announcements        - List all announcements
GET  /work/communications/announcements/create - Create form
POST /work/communications/announcements        - Store announcement
GET  /work/communications/announcements/{id}/edit - Edit form
PUT  /work/communications/announcements/{id}   - Update announcement
POST /work/communications/announcements/{id}/publish - Publish
DELETE /work/communications/announcements/{id} - Delete
```

**Permissions Required:**
- `communications.send` - View communications
- `communications.publish` - Publish announcements
- `communications.delete` - Delete announcements

---

### 2.2 Support Ticket System

**Table:** `support_tickets`
**Related Table:** `ticket_responses`

**Models:** `SupportTicket`, `TicketResponse`

**Features:**
- User-submitted support tickets with multiple categories (billing, technical, feature_request, bug, other)
- Priority levels: low, medium, high, critical
- Ticket statuses: open, in_progress, waiting_user, resolved, closed
- Assign tickets to team members
- Track response time in hours
- Internal vs. public responses
- Resolution notes and tracking
- Bulk ticket assignment and management

**Support Ticket Fields:**
- Title, Description
- Category (billing, technical, feature_request, bug, other)
- Priority (low, medium, high, critical)
- Status (open, in_progress, waiting_user, resolved, closed)
- Assigned to team member
- Resolution notes
- Response time tracking

**Controller Methods:**
- `index(Request $request)` - List tickets with filtering by status/priority/category
- `show(SupportTicket $ticket)` - View ticket details and responses
- `reply(Request $request, SupportTicket $ticket)` - Add response to ticket
- `resolve(Request $request, SupportTicket $ticket)` - Mark ticket resolved
- `assign(Request $request, SupportTicket $ticket)` - Assign to team member
- `updateStatus(Request $request, SupportTicket $ticket)` - Change ticket status

**Routes:**
```
GET  /work/support                    - List tickets
GET  /work/support/{ticket}           - View ticket details
POST /work/support/{ticket}/reply     - Add response
POST /work/support/{ticket}/resolve   - Resolve ticket
POST /work/support/{ticket}/assign    - Assign to team member
POST /work/support/{ticket}/status    - Update status
```

**Permissions Required:**
- `support.tickets` - View support tickets
- `support.resolve` - Resolve tickets
- `support.assign` - Assign tickets
- `support.manage` - Manage ticket status

**Metrics:**
- Open ticket count
- Critical ticket count
- Average response time

---

## Phase 2: System Monitoring

### 2.3 Health Check System

**Table:** `health_checks`

**Model:** `HealthCheck`

**Features:**
- Monitor service health status
- Track consecutive failures
- Record response times
- Get alert on service degradation or outages
- Services: database, cache, email, API, queue, storage, etc.

**Health Status Levels:**
- `healthy` - All good
- `degraded` - Service responding but with issues
- `down` - Service unavailable

**Controller Methods:**
- `health()` - View all service health checks
- `recordHealthCheck(Request $request)` - API endpoint to record health status (protected with token)

**Routes:**
```
GET  /work/monitoring/health         - View health status of all services
POST /work/monitoring/record-health-check - API to record health check (no middleware)
```

**Health Check Fields:**
- Service name (unique)
- Status (healthy, degraded, down)
- Error message (if applicable)
- Response time in ms
- Consecutive failures count
- Last checked at
- Last failure at

**Methods on Model:**
- `markHealthy()` - Mark service as healthy
- `markDegraded($errorMessage)` - Mark as degraded
- `markDown($errorMessage)` - Mark as down
- `getUnhealthyServices()` - Get all non-healthy services

---

### 2.4 System Metrics

**Table:** `system_metrics`

**Model:** `SystemMetric`

**Features:**
- Track system performance metrics
- CPU usage percentage
- Memory usage percentage
- Disk usage percentage
- Active user count
- Total requests
- Response time (avg in ms)
- Failed requests count
- Uptime percentage
- Service status (JSON)

**Controller Methods:**
- `index()` - Show latest metrics with 24h trend
- `performance()` - Detailed performance analytics
- `database()` - Database and disk usage monitoring
- `backups()` - Backup status
- `recordMetric(Request $request)` - API endpoint to record metrics (protected with token)

**Routes:**
```
GET  /work/monitoring/performance     - Performance charts and analytics
GET  /work/monitoring/database        - Disk and database metrics
GET  /work/monitoring/backups         - Backup status
POST /work/monitoring/record-metric   - API to record metrics (no middleware)
```

**Metrics Recording:**
- Called periodically from background jobs or external monitoring service
- Authenticated with Bearer token from config
- Records timestamp for trending analysis

---

## Phase 3: AI Management

### 3.1 AI Model Configuration

**Table:** `ai_model_configs`

**Model:** `AIModelConfig`

**Features:**
- Manage available AI models
- Track provider (OpenAI, Anthropic, DeepSeek, etc.)
- Store pricing information (cost per 1k tokens)
- Track capabilities per model
- Enable/disable models
- Store model settings

**Pre-seeded Models:**
- GPT-4 (OpenAI)
- GPT-3.5-turbo (OpenAI)
- Claude 3 Opus (Anthropic)
- Claude 3 Sonnet (Anthropic)
- DeepSeek Chat
- DeepSeek Coder

**Fields:**
- model_name (unique)
- provider
- cost_per_1k_input_tokens
- cost_per_1k_output_tokens
- max_tokens
- is_active
- capabilities (JSON array)
- settings (JSON)

**Methods:**
- `getCostPerRequest($inputTokens, $outputTokens)` - Calculate cost
- `getActiveModels()` - Get enabled models only
- `getByName($name)` - Fetch specific model

---

### 3.2 AI Usage Logging

**Table:** `ai_usage_logs`

**Model:** `AIUsageLog`

**Features:**
- Track every AI feature usage
- Record input and output tokens
- Calculate costs automatically
- Track which feature was used
- Track which user and school
- Store metadata (metadata JSON)

**Usage Features:**
- chat
- analysis
- generation
- correction
- tutoring

**Controller Methods:**
- `index()` - Overview of AI usage and costs
- `comparison(Request $request)` - Compare model performance and costs
- `costs(Request $request)` - Detailed cost analysis by model, feature, user
- `logUsage(Request $request)` - API endpoint to record usage (from app)

**Routes:**
```
GET  /work/ai                - AI dashboard overview
GET  /work/ai/comparison     - Model comparison
GET  /work/ai/costs          - Cost analysis
POST /work/ai/log-usage      - API to log AI usage (no middleware)
```

**Cost Tracking Metrics:**
- Total cost (all time, last 30 days)
- Cost by model
- Cost by feature
- Cost by user (top expensive users)
- Average cost per request
- Cost trends

**Usage Analysis:**
- Total tokens used
- Tokens by model
- Tokens by feature
- Average tokens per request
- Expensive requests identification

---

### 3.3 Prompt Library

**Table:** `prompt_library`

**Model:** `PromptLibrary`

**Features:**
- Central library of system prompts
- Organized by category
- Track usage count and average cost per use
- Quality scoring system
- Public vs. private prompts
- Active/archived prompts
- Variable placeholder support

**Controller Methods:**
- `prompts(Request $request)` - List prompts with filtering and sorting
- `createPrompt()` - Show creation form
- `storePrompt(Request $request)` - Create new prompt
- `editPrompt(PromptLibrary $prompt)` - Edit form
- `updatePrompt(Request $request, PromptLibrary $prompt)` - Update prompt
- `deletePrompt(Request $request, PromptLibrary $prompt)` - Archive prompt

**Routes:**
```
GET  /work/ai/prompts              - List prompts
GET  /work/ai/prompts/create       - Create form
POST /work/ai/prompts              - Create prompt
GET  /work/ai/prompts/{prompt}/edit - Edit form
PUT  /work/ai/prompts/{prompt}     - Update prompt
DELETE /work/ai/prompts/{prompt}   - Archive prompt
```

**Permissions:**
- `ai.stats` - View AI statistics
- `ai.costs` - View detailed costs
- `ai.manage` - Create/edit/delete prompts

**Prompt Fields:**
- Title
- Prompt text
- Category
- Description
- Variables (JSON - list of variable names)
- Usage count
- Average cost per use
- Average quality score (0-100)
- Is public (can be used in templates)
- Is active (archived if false)

**Methods:**
- `recordUsage($cost, $qualityScore)` - Update usage stats
- `getByCategory($category, $publicOnly)` - Filter by category
- `getMostUsed($limit)` - Get most frequently used
- `getCheapest($limit)` - Get lowest cost prompts

**Quality Scoring:**
- 0-100 scale
- Updated when prompt is used
- Tracks average quality over time
- Identifies best performing prompts

---

## Error Tracking (Enhanced)

### Table: `error_logs` (Extended)

**Enhanced Methods in ErrorTrackingController:**
- `index(Request $request)` - List errors with severity/status filtering
- `show(ErrorLog $error)` - View error details
- `resolve(Request $request, ErrorLog $error)` - Mark as resolved
- `assign(Request $request, ErrorLog $error)` - Assign to team member
- `exportData()` - Export errors as CSV

**Error Tracking Features:**
- Severity levels: error, warning, critical
- Resolution tracking
- Assignment to team members
- Stack trace and context stored
- Error deduplication
- Bulk export

---

## Database Migrations Summary

**Phase 2 & 3 Migrations Created:**

1. `2025_12_08_create_support_tickets_table` - Support ticket system
2. `2025_12_08_create_ticket_responses_table` - Ticket responses
3. `2025_12_08_create_announcements_table` - Renamed to `system_announcements`
4. `2025_12_08_create_health_checks_table` - Service health monitoring
5. `2025_12_08_create_system_metrics_table` - Performance metrics
6. `2025_12_08_create_ai_usage_logs_table` - AI usage tracking
7. `2025_12_08_create_ai_model_configs_table` - AI model configuration
8. `2025_12_08_create_prompt_library_table` - Prompt library

**Seeded Data:**
- 6 AI models (GPT-4, GPT-3.5, Claude Opus, Claude Sonnet, DeepSeek Chat, DeepSeek Coder)

---

## Permissions Added

**Phase 2 & 3 Permissions:**

```
// Communication & Announcements
communications.send      - Send announcements
communications.publish   - Publish announcements
communications.delete    - Delete announcements
communications.email     - Send emails

// Support Tickets
support.tickets          - View support tickets
support.resolve          - Resolve tickets
support.assign           - Assign tickets to team members
support.manage           - Manage ticket status

// System Monitoring
system.logs              - View system logs and metrics (already exists)
monitoring.health        - View health checks
monitoring.performance   - View performance metrics

// AI Features
ai.stats                 - View AI statistics
ai.costs                 - View detailed AI costs
ai.manage                - Manage prompt library
```

---

## API Endpoints (External)

These endpoints allow external services to send data to the dashboard without authentication (protected by token):

### System Metrics Recording
```
POST /work/monitoring/record-metric
Authorization: Bearer {MONITORING_TOKEN}

{
    "cpu_usage": 45.2,
    "memory_usage": 62.1,
    "disk_usage": 78.5,
    "active_users": 1250,
    "total_requests": 45000,
    "response_time_ms": 125.5,
    "failed_requests": 15,
    "uptime_percentage": 99.95,
    "service_status": { "database": "healthy", "cache": "healthy" }
}
```

### Health Check Recording
```
POST /work/monitoring/record-health-check
Authorization: Bearer {MONITORING_TOKEN}

{
    "service_name": "database",
    "status": "healthy",
    "error_message": null,
    "response_time_ms": 12.5
}
```

### AI Usage Logging
```
POST /work/ai/log-usage

{
    "user_id": 123,
    "model_used": "gpt-4",
    "input_tokens": 250,
    "output_tokens": 500,
    "feature": "chat",
    "metadata": {
        "conversation_id": "abc123",
        "session_duration_ms": 5000
    }
}
```

---

## Dashboard Widgets

### Communication Dashboard
- Recent announcements
- Pinned announcements count
- Announcement reach statistics
- Draft announcements

### Support Dashboard
- Open tickets count
- Critical tickets count
- Average response time
- Tickets by priority
- Recent unresolved tickets

### Monitoring Dashboard
- Current system metrics (CPU, Memory, Disk)
- Service health status
- Service health status indicators
- 24-hour performance trends
- Performance graph (CPU, Memory usage)

### AI Dashboard
- Total AI cost (all time)
- Total tokens used
- Average tokens per request
- Cost by model breakdown
- Recent AI usage history
- Most expensive models

---

## Usage Examples

### Create a System Announcement
```php
$announcement = SystemAnnouncement::create([
    'created_by' => auth()->user()->teamMember->id,
    'title' => 'System Maintenance',
    'content' => 'Scheduled maintenance on Dec 15...',
    'target' => 'all',
    'type' => 'warning',
    'is_pinned' => true,
    'published_at' => now(),
    'expires_at' => now()->addDays(7),
]);
```

### Record Support Ticket Response
```php
TicketResponse::create([
    'ticket_id' => $ticket->id,
    'team_member_id' => auth()->user()->teamMember->id,
    'response' => 'Thank you for reporting this issue...',
    'is_internal' => false,
]);
```

### Log AI Usage
```php
$model = AIModelConfig::where('model_name', 'gpt-4')->first();
$cost = $model->getCostPerRequest(250, 500);

AIUsageLog::create([
    'user_id' => $userId,
    'model_used' => 'gpt-4',
    'input_tokens' => 250,
    'output_tokens' => 500,
    'cost' => $cost,
    'feature' => 'chat',
    'used_at' => now(),
]);
```

### Record System Metrics
```php
SystemMetric::recordMetric([
    'cpu_usage' => 45.2,
    'memory_usage' => 62.1,
    'disk_usage' => 78.5,
    'active_users' => 1250,
    'total_requests' => 45000,
    'response_time_ms' => 125.5,
    'failed_requests' => 15,
    'uptime_percentage' => 99.95,
    'service_status' => ['database' => 'healthy', 'cache' => 'healthy'],
]);
```

---

## Configuration

### Environment Variables Needed

Add to `.env`:
```
MONITORING_TOKEN=your-secure-token-here
AI_MODEL_DEFAULT=gpt-4
FEATURE_ANNOUNCEMENTS=true
FEATURE_SUPPORT_TICKETS=true
FEATURE_AI_TRACKING=true
```

---

## Testing Checklist

- [ ] Create system announcement and verify display
- [ ] Publish scheduled announcement
- [ ] Pin/unpin announcement
- [ ] Create support ticket as user
- [ ] Reply to support ticket as team member
- [ ] Resolve support ticket
- [ ] Record health check via API
- [ ] Record system metric via API
- [ ] View AI usage costs
- [ ] Compare AI model performance
- [ ] Create prompt in library
- [ ] Use prompt library filter/sort
- [ ] Export error logs
- [ ] Verify all permissions working

---

## File Locations

**Controllers:**
- `app/Http/Controllers/Team/CommunicationController.php`
- `app/Http/Controllers/Team/SupportController.php`
- `app/Http/Controllers/Team/MonitoringController.php`
- `app/Http/Controllers/Team/AIController.php`
- `app/Http/Controllers/Team/ErrorTrackingController.php`

**Models:**
- `app/Models/SystemAnnouncement.php`
- `app/Models/SupportTicket.php`
- `app/Models/TicketResponse.php`
- `app/Models/HealthCheck.php`
- `app/Models/SystemMetric.php`
- `app/Models/AIUsageLog.php`
- `app/Models/AIModelConfig.php`
- `app/Models/PromptLibrary.php`

**Migrations:**
- `database/migrations/2025_12_08_create_support_tickets_table.php`
- `database/migrations/2025_12_08_create_ticket_responses_table.php`
- `database/migrations/2025_12_08_create_announcements_table.php`
- `database/migrations/2025_12_08_create_health_checks_table.php`
- `database/migrations/2025_12_08_create_system_metrics_table.php`
- `database/migrations/2025_12_08_create_ai_usage_logs_table.php`
- `database/migrations/2025_12_08_create_ai_model_configs_table.php`
- `database/migrations/2025_12_08_create_prompt_library_table.php`

**Seeders:**
- `database/seeders/AIModelSeeder.php`

**Routes:**
- `routes/team.php` (updated with Phase 2 & 3 routes)

---

## Notes

- System announcements use table `system_announcements` to avoid conflicts with existing school `announcements` table
- All team actions are logged in `admin_audit_logs`
- External API endpoints don't require team member authentication (only token-based)
- AI costs are calculated in real-time using model configuration pricing
- Prompts can be soft-deleted by setting `is_active = false`
- Support tickets track response time automatically
- All metrics are timestamped for trend analysis

---

## Next Steps

1. Create views for all Phase 2 & 3 modules
2. Set up background job to collect system metrics
3. Implement health check monitoring service
4. Configure AI usage logging from main app
5. Test all API endpoints with proper tokens
6. Set up email notifications for critical issues
