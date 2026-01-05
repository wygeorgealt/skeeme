# Phase 2 API Documentation

## Base URL
```
https://yourapp.com/work/
```

---

## 📧 Email Campaigns API

### List Email Campaigns
```http
GET /work/communications/emails
```

**Parameters:**
- `status` (optional): Filter by status (draft|scheduled|sending|sent|failed)
- `search` (optional): Search in subject

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "subject": "New Features",
      "body": "<h1>...</h1>",
      "recipient_type": "all_admins",
      "status": "sent",
      "sent_count": 45,
      "failed_count": 0,
      "created_at": "2025-12-08T10:30:00Z",
      "updated_at": "2025-12-08T10:35:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### Create Email Campaign
```http
GET /work/communications/emails/create
```

Returns HTML form for creating campaign.

---

### Store Email Campaign
```http
POST /work/communications/emails
```

**Request Body:**
```json
{
  "subject": "New Features Available",
  "body": "<h1>Announcement</h1><p>Check out our new features...</p>",
  "recipient_type": "all_admins",
  "status": "draft",
  "scheduled_at": "2025-12-15T10:00:00Z"
}
```

**Recipient Types:**
- `all_admins` - All school administrators
- `specific_schools` - Specific schools (requires school_ids array)
- `specific_admin` - Single admin (requires user_id)
- `all_users` - All registered users

**Response:**
```json
{
  "id": 1,
  "subject": "New Features Available",
  "status": "draft",
  "created_at": "2025-12-08T10:30:00Z"
}
```

---

### Show Email Campaign
```http
GET /work/communications/emails/{campaign_id}
```

**Response:**
```json
{
  "id": 1,
  "subject": "New Features Available",
  "body": "<h1>Announcement</h1>...",
  "recipient_type": "all_admins",
  "recipients_count": 45,
  "status": "draft",
  "sent_count": 0,
  "failed_count": 0,
  "sent_at": null,
  "created_at": "2025-12-08T10:30:00Z"
}
```

---

### Send Email Campaign
```http
POST /work/communications/emails/{campaign_id}/send
```

**Response:**
```json
{
  "status": "sent",
  "sent_count": 45,
  "failed_count": 0,
  "message": "Email campaign sent successfully to 45 recipients"
}
```

**Requires Permission:** `communications.email`

---

## 🔔 Toast Notifications API

### List Toast Notifications
```http
GET /work/communications/toasts
```

**Parameters:**
- `type` (optional): Filter by type (info|success|warning|error)
- `recipient_type` (optional): Filter by recipient type
- `published` (optional): 1 for published, 0 for draft

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Success!",
      "message": "New payment processing is live",
      "type": "success",
      "recipient_type": "all_admins",
      "duration_seconds": 5,
      "is_dismissible": true,
      "published_at": "2025-12-08T10:30:00Z",
      "view_count": 34,
      "created_at": "2025-12-08T10:30:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### Create Toast Notification
```http
GET /work/communications/toasts/create
```

Returns HTML form for creating toast.

---

### Store Toast Notification
```http
POST /work/communications/toasts
```

**Request Body:**
```json
{
  "title": "Success!",
  "message": "New payment processing is live",
  "type": "success",
  "recipient_type": "all_admins",
  "duration_seconds": 5,
  "is_dismissible": true,
  "publish_now": true
}
```

**Types:**
- `info` - Information message (blue)
- `success` - Success message (green)
- `warning` - Warning message (yellow)
- `error` - Error message (red)

**Recipient Types:**
- `all_admins` - All administrators
- `specific_schools` - Specific schools (requires school_ids array)
- `specific_admin` - Single admin (requires user_id)

**Response:**
```json
{
  "id": 1,
  "title": "Success!",
  "message": "New payment processing is live",
  "status": "draft"
}
```

---

### Publish Toast Notification
```http
POST /work/communications/toasts/{toast_id}/publish
```

**Response:**
```json
{
  "id": 1,
  "published_at": "2025-12-08T10:35:00Z",
  "recipients_notified": 45,
  "message": "Toast notification published and sent to 45 admins"
}
```

**Requires Permission:** `communications.publish`

---

### Delete Toast Notification
```http
DELETE /work/communications/toasts/{toast_id}
```

**Response:**
```json
{
  "message": "Toast notification deleted successfully"
}
```

**Requires Permission:** `communications.delete`

---

## 🎁 Subscription Promotions API

### List Promotions
```http
GET /work/promotions
```

**Parameters:**
- `status` (optional): Filter by status (active|paused|expired)
- `search` (optional): Search by code or name
- `page` (optional): Pagination page

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "code": "SUMMER50",
      "name": "Summer 50% Off",
      "discount_type": "percentage",
      "discount_value": 50,
      "discount_formatted": "50%",
      "max_uses": 100,
      "used_count": 45,
      "status": "active",
      "valid_from": "2025-12-01",
      "valid_until": "2025-12-31",
      "created_at": "2025-12-08T10:30:00Z"
    }
  ],
  "stats": {
    "active_count": 8,
    "total_used": 234
  },
  "pagination": {...}
}
```

---

### View Promotion Stats
```http
GET /work/promotions/stats
```

**Response:**
```json
{
  "total_promotions": 12,
  "active_promotions": 8,
  "total_usages": 234,
  "total_discounted": 5432.50,
  "top_promotions": [
    {
      "code": "SUMMER50",
      "name": "Summer 50% Off",
      "usage_count": 45,
      "total_discount": 2250.00
    }
  ],
  "discount_trend": [
    {
      "date": "2025-12-01",
      "amount": 150.00,
      "count": 3
    }
  ]
}
```

---

### Create Promotion
```http
GET /work/promotions/create
```

Returns HTML form for creating promotion.

---

### Store Promotion
```http
POST /work/promotions
```

**Request Body:**
```json
{
  "code": "SUMMER50",
  "name": "Summer 50% Off",
  "discount_type": "percentage",
  "discount_value": 50,
  "max_uses": 100,
  "max_per_school": 5,
  "min_subscription_amount": 0,
  "applies_to_all_plans": true,
  "applies_to_first_month": true,
  "applies_to_renewal": false,
  "valid_from": "2025-12-01",
  "valid_until": "2025-12-31",
  "duration_months": 1,
  "status": "active"
}
```

**Discount Types:**
- `percentage` - Percentage discount (0-100)
- `fixed_amount` - Fixed dollar amount

**Response:**
```json
{
  "id": 1,
  "code": "SUMMER50",
  "name": "Summer 50% Off",
  "status": "active",
  "created_at": "2025-12-08T10:30:00Z"
}
```

**Requires Permission:** `subscriptions.manage`

---

### Show Promotion
```http
GET /work/promotions/{promotion_id}
```

**Response:**
```json
{
  "promotion": {
    "id": 1,
    "code": "SUMMER50",
    "name": "Summer 50% Off",
    "discount_type": "percentage",
    "discount_value": 50,
    "discount_formatted": "50%",
    "max_uses": 100,
    "used_count": 45,
    "max_per_school": 5,
    "min_subscription_amount": 0,
    "applies_to_all_plans": true,
    "applies_to_first_month": true,
    "applies_to_renewal": false,
    "valid_from": "2025-12-01",
    "valid_until": "2025-12-31",
    "duration_months": 1,
    "status": "active",
    "created_at": "2025-12-08T10:30:00Z"
  },
  "usages": [
    {
      "id": 1,
      "school_id": 5,
      "school_name": "Central High School",
      "discount_amount": 50.00,
      "original_price": 100.00,
      "final_price": 50.00,
      "created_at": "2025-12-08T11:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### Edit Promotion
```http
GET /work/promotions/{promotion_id}/edit
```

Returns HTML form for editing promotion.

---

### Update Promotion
```http
PUT /work/promotions/{promotion_id}
```

**Request Body:** (Same as Store)

**Response:**
```json
{
  "id": 1,
  "code": "SUMMER50",
  "status": "active",
  "message": "Promotion updated successfully"
}
```

**Requires Permission:** `subscriptions.manage`

---

### Pause Promotion
```http
POST /work/promotions/{promotion_id}/pause
```

**Response:**
```json
{
  "id": 1,
  "status": "paused",
  "message": "Promotion paused successfully"
}
```

**Requires Permission:** `subscriptions.manage`

---

### Resume Promotion
```http
POST /work/promotions/{promotion_id}/resume
```

**Response:**
```json
{
  "id": 1,
  "status": "active",
  "message": "Promotion resumed successfully"
}
```

**Requires Permission:** `subscriptions.manage`

---

### Delete Promotion
```http
DELETE /work/promotions/{promotion_id}
```

**Response:**
```json
{
  "message": "Promotion deleted successfully"
}
```

**Requires Permission:** `subscriptions.manage`

---

### Validate Promotion Code
```http
POST /promotions/validate
```

**Note:** This is a PUBLIC endpoint with NO authentication required. Perfect for subscription checkout page.

**Request Body:**
```json
{
  "code": "SUMMER50",
  "amount": 100.00
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "code": "SUMMER50",
  "discount": 50.00,
  "discount_formatted": "50%",
  "discount_type": "percentage",
  "original_amount": 100.00,
  "final_amount": 50.00,
  "message": "Promotion applied successfully"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "code": "INVALID",
  "message": "Promotion code has expired",
  "error_type": "expired"
}
```

**Error Types:**
- `not_found` - Code doesn't exist
- `inactive` - Promotion is paused
- `expired` - Promotion date range has ended
- `max_uses_exceeded` - Too many uses
- `max_per_school_exceeded` - This school has used it too many times
- `min_amount_not_met` - Subscription amount too low

---

## 🔐 Authentication & Permissions

### Required Headers
```http
Authorization: Bearer {token}
X-CSRF-TOKEN: {csrf_token}
Content-Type: application/json
```

### Permissions
```
communications.send     - Send emails and create notifications
communications.publish  - Publish announcements and notifications
communications.email    - Send email campaigns
communications.delete   - Delete communications
subscriptions.manage    - Create and manage promotions
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": {
    "code": ["The code field is required"],
    "discount_value": ["Must be between 0 and 100"]
  }
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "message": "This action is unauthorized"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "message": "The given data was invalid",
  "errors": {
    "valid_until": ["Valid until must be after valid from"]
  }
}
```

---

## 📊 Rate Limiting

All authenticated endpoints are subject to:
- **60 requests per minute** per user
- **1000 requests per hour** per IP

---

## 🧪 Example Usage

### JavaScript - Validate Promotion Code
```javascript
async function validatePromoCode(code, amount) {
  const response = await fetch('/promotions/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    },
    body: JSON.stringify({
      code: code,
      amount: amount
    })
  });
  
  const data = await response.json();
  
  if (data.valid) {
    console.log(`Discount: ${data.discount_formatted}`);
    console.log(`Final amount: $${data.final_amount}`);
  } else {
    console.log(`Invalid: ${data.message}`);
  }
  
  return data;
}

// Usage
validatePromoCode('SUMMER50', 100);
```

### PHP - Create Email Campaign
```php
$campaign = EmailCampaign::create([
    'team_id' => auth()->user()->current_team_id,
    'user_id' => auth()->id(),
    'subject' => 'New Features',
    'body' => '<h1>Announcement</h1>',
    'recipient_type' => 'all_admins',
    'status' => 'draft',
]);

$campaign->send();
```

### PHP - Create Toast Notification
```php
ToastNotification::create([
    'team_id' => auth()->user()->current_team_id,
    'user_id' => auth()->id(),
    'title' => 'Payment Received',
    'message' => 'School payment processed successfully',
    'type' => 'success',
    'recipient_type' => 'specific_admin',
    'recipient_users' => [1, 2, 3],
    'duration_seconds' => 5,
])->publish();
```

---

## 📝 Changelog

### Version 1.0 (December 8, 2025)
- Initial release of Phase 2 features
- Email campaigns API
- Toast notifications API
- Promotions API with validation endpoint

---

Last Updated: December 8, 2025
