# Skeeme Team Management Dashboard

## Overview

The Skeeme Team Management Dashboard is a secure, private interface accessible only to authorized team members. It provides comprehensive tools for managing users, subscriptions, analytics, errors, communications, and system operations.

**Access Point:** `https://skeeme.test/work` (secret URL - not `/team`)

---

## Team Member Credentials

The following team members have been seeded into the database:

| Name | Email | Password | Role |
|------|-------|----------|------|
| Super Admin | `admin@skeeme.dev` | `EDucation` | Super Admin |
| George Future | `george@skeeme.dev` | `GEORGE.future` | Admin |
| Support Team | `support@skeeme.dev` | `wwewwr123` | Support |
| Finance Manager | `finance@skeeme.dev` | `WWEwwr_123` | Finance |

---

## Architecture

### Database Tables

1. **team_members** - Team member records with roles and permissions
2. **admin_audit_logs** - Complete audit trail of all team actions
3. **error_logs** - Application error tracking and management
4. **users** (extended) - Added flags: `is_flagged`, `is_vip`, `is_beta_tester`, `is_banned`, `custom_api_limit`, `preferred_ai_model`

### Middleware

- **EnsureTeamMember** - Verifies user is active team member
- **CheckTeamPermission** - Validates specific permissions for routes

### Role-Based Access Control

#### Super Admin
- Full access to all features
- Can manage team members
- Can toggle system features
- Can view all audit logs

#### Admin
- All permissions except team management
- Designated team leader role

#### Support
- View users
- View subscriptions
- View payments
- Send communications
- Manage support tickets
- Impersonate users
- View audit logs

#### Finance
- View subscriptions
- Process refunds
- View and retry payments

#### Developer
- View system logs
- Modify system settings
- View AI statistics
- View audit logs

#### Analyst
- View users
- View subscriptions
- View AI statistics and costs

---

## Features

### Phase 1 (Complete Foundation)

#### 1. User Management (`/work/users`)
- **List & Filter** - Search by name/email, filter by status and flags
- **User Details** - View individual user information
- **Ban/Unban** - Ban users from the platform with reasons
- **Flagging** - Mark users for investigation (flagged, VIP, beta tester)
- **Bulk Actions** - Ban multiple users at once
- **Impersonation** - Impersonate users to reproduce issues (logged)
- **Data Export** - Export user data for GDPR compliance

**Audit Logged:** All user actions are tracked with timestamp, team member, IP, and user agent

#### 2. Analytics Dashboard (`/work/analytics`)
- **User Growth** - Daily/weekly/monthly signup trends
- **Revenue Metrics** - MRR, ARR, lifetime value, churn rate
- **API Usage** - Token consumption, cost per user, rate limits
- **Feature Analytics** - Which AI models are most used, conversation lengths
- **Conversion Funnel** - Free trial to paid conversion tracking
- **Geographic Distribution** - Where users are located

#### 3. Error Tracking (`/work/errors`)
- **Real-time Error Logs** - All application errors captured
- **Search & Filter** - By error code, severity, user, date
- **Error Details** - Stack trace, file path, line number, context
- **Resolution Tracking** - Mark errors as resolved with notes
- **Error Assignment** - Assign to team members for investigation

#### 4. Subscription Management (`/work/subscriptions`)
- **List Subscriptions** - All active and inactive subscriptions
- **Subscription Details** - View full subscription history
- **Process Refunds** - Issue refunds directly
- **Cancel Subscriptions** - Cancel with reasons
- **Renew Subscriptions** - Extend expiry dates for manual accounts

---

### Phase 2 (Communication & Monitoring)

#### 5. Communication Tools (`/work/communications`)
- **System Announcements** - Send alerts to all users
- **Targeted Email** - Send emails to individual users or segments
- **Canned Responses** - Pre-written responses for common issues
- **Email Templates** - Customize transactional emails

#### 6. Support Ticket System (`/work/support`)
- **Ticket Management** - Track and respond to support requests
- **Ticket Assignment** - Assign to team members
- **Response History** - Full conversation history
- **SLA Tracking** - Monitor response times

#### 7. Payment Management (`/work/payments`)
- **Payment Tracking** - All payment transactions
- **Failed Payment Recovery** - Retry failed payments
- **Refund Processing** - Issue refunds with audit trail
- **Payment History** - Complete payment lifecycle

#### 8. System Monitoring (`/work/monitoring`)
- **System Health** - Real-time health checks
- **Performance Metrics** - CPU, memory, disk usage
- **Database Monitoring** - Slow query detection, connection pools
- **API Response Times** - Endpoint performance tracking
- **Error Rate Monitoring** - Alert on error spikes
- **Background Jobs** - Failed and pending job queues
- **Backup Status** - Verify backup completion

---

### Phase 3 (Advanced Features)

#### 9. AI Statistics (`/work/ai`)
- **Model Comparison** - DeepSeek vs OpenAI performance
- **Cost Analysis** - Cost per conversation, expensive users
- **Prompt Library** - Store and test system prompts
- **Content Moderation** - Flag inappropriate conversations
- **Token Usage Alerts** - Notify when approaching limits
- **Model Forcing** - Force specific users to use particular models

#### 10. Team Management (`/work/team-members`)
- **Member Listing** - All team members with roles
- **Invite Members** - Send invitations to new team members
- **Edit Roles** - Change team member roles and permissions
- **2FA Setup** - Enable two-factor authentication
- **Deactivate Members** - Remove access for departing staff
- **Activity Tracking** - Last login, actions performed

#### 11. Audit Logs (`/work/audit-logs`)
- **Complete Audit Trail** - Every admin action logged
- **Search & Filter** - By team member, action, resource, date
- **Detailed Changes** - View what changed and when
- **Non-editable** - Audit logs are append-only and immutable
- **Export** - Download audit logs for compliance

#### 12. System Settings (`/work/settings`)
- **Feature Flags** - Toggle features on/off without code
- **Environment Variables** - Manage configuration
- **Rate Limiting** - Configure API rate limits
- **IP Whitelisting** - Restrict access by IP (optional)
- **Email Configuration** - SMTP settings

---

## Security Features

### Authentication
✅ Team-specific login page (`/work`)
✅ Separate from regular user authentication
✅ Email + Password authentication
✅ Remember me functionality
✅ Password reset via email

### Authorization
✅ Role-based access control (RBAC)
✅ Fine-grained permission system
✅ Permission validation on every request
✅ Middleware enforcement

### Audit & Compliance
✅ Complete audit logging of all actions
✅ Timestamp, team member, IP, and user agent tracking
✅ Immutable audit logs (append-only)
✅ User data export (GDPR)
✅ Session timeout for inactive users

### Additional Security
✅ CSRF protection
✅ SQL injection prevention
✅ XSS protection
✅ Password hashing (bcrypt)
✅ Optional 2FA for team members
✅ Activity logging (last login)

---

## Routes

All routes are accessible from `/work/` and require authentication + team member status.

```
/work                           - Login page
/work/login                     - POST login
/work/logout                    - POST logout
/work/forgot-password           - Forgot password form
/work/reset-password/{token}    - Reset password form

/work/dashboard                 - Main dashboard (metrics & alerts)
/work/users                     - User management
/work/analytics                 - Analytics dashboard
/work/errors                    - Error tracking
/work/subscriptions             - Subscription management
/work/payments                  - Payment management
/work/communications            - Email & announcements
/work/support                   - Support tickets
/work/monitoring                - System health
/work/team-members              - Team management
/work/audit-logs                - Audit trail
/work/ai                        - AI statistics
/work/settings                  - System settings
```

---

## Workflow Examples

### Example 1: Ban a User
1. Navigate to `/work/users`
2. Search for user by name or email
3. Click "View" to see user details
4. Click "Ban User" button
5. Enter reason (required)
6. Confirm - user is banned and action is logged

### Example 2: Track Down an Error
1. Navigate to `/work/errors`
2. Filter by severity "Critical" or recent errors
3. Click on error to see full stack trace
4. Assign to developer
5. Mark as resolved when fixed

### Example 3: Process a Refund
1. Navigate to `/work/subscriptions` or `/work/payments`
2. Find the subscription/payment
3. Click "Process Refund"
4. Verify amount and confirm
5. Refund issued, audit log created

### Example 4: Impersonate a User to Debug
1. Navigate to `/work/users`
2. Find the user experiencing issues
3. Click "Impersonate"
4. You're logged in as that user - can reproduce their issue
5. Click "Exit Impersonation" when done
6. Action is logged with your username

---

## Audit Logging

Every action in the team dashboard is automatically logged. Examples:

- `user.ban` - User banned
- `user.unban` - User unbanned
- `user.flag` - User flagged for review
- `user.vip_toggle` - VIP status changed
- `user.bulk_ban` - Multiple users banned
- `user.impersonate_start` - Impersonation started
- `subscription.refund` - Refund processed
- `payment.retry` - Payment retry attempted
- `auth.login` - Team member login
- `auth.logout` - Team member logout
- `communication.announcement` - Announcement sent
- `support.ticket_resolved` - Support ticket resolved
- `team.member_invited` - New team member invited
- `team.role_updated` - Team member role changed

---

## Best Practices

### When Using the Dashboard

1. **Always use audit logs** - Check `/work/audit-logs` to verify actions
2. **Document decisions** - Add notes when flagging users
3. **Least privilege** - Give team members only needed permissions
4. **Review regularly** - Check error logs weekly for patterns
5. **Secure credentials** - Never share team member passwords
6. **Test in staging** - Test feature flags in staging first
7. **Backup logs** - Regularly export audit logs for compliance

### For Developers Adding Features

1. Use `AdminAuditLog::log()` to log all actions:
   ```php
   AdminAuditLog::log(
       $teamMember,
       'action.name',
       'ResourceType',
       $resourceId,
       ['key' => 'value'] // changes
   );
   ```

2. Check permissions before actions:
   ```php
   if (!$teamMember->hasPermission('users.ban')) {
       abort(403);
   }
   ```

3. Update last_login on authentication
4. Include validation and error handling
5. Use middleware for permission checks

---

## Troubleshooting

### Can't Access Dashboard
- Ensure you're using the correct URL: `/work` (not `/team`)
- Verify your email and password
- Check if your team member account is active
- Check audit logs to see if your account was deactivated

### Missing Permissions
- Check your role in `/work/team-members`
- Super Admins can grant additional permissions
- Contact admin@skeeme.dev if you need access

### Audit Logs Not Appearing
- Ensure you're logged in as a team member
- Check the resource type and filter
- Audit logs are real-time and immutable

---

## Future Enhancements

- [ ] Two-factor authentication for all team members
- [ ] Activity dashboard showing team member workload
- [ ] Webhook integrations for error notifications
- [ ] Bulk import of users/subscriptions
- [ ] Advanced filtering and saved filter views
- [ ] Scheduled reports emailed to team
- [ ] API for programmatic access to team operations
- [ ] Mobile app for on-the-go access
- [ ] Integration with Slack for alerts

---

## Support

For issues or questions about the Team Dashboard:
1. Check this documentation
2. Review audit logs for context
3. Contact the development team
4. Open an internal issue ticket

---

**Last Updated:** December 8, 2025
**Version:** 1.0 (Phase 1 Complete)
