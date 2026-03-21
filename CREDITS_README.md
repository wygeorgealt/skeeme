# Airtight Credit Enforcement System

This document explains the architecture of the credit protection system in the Skeeme API.

## Core Principle
AI generation is expensive. To protect the credit economy, we enforce **pre-generation verification** at the middleware layer. This ensures that no AI resources are consumed if a user has an insufficient balance.

## Components

### 1. `CheckSufficientCredits` Middleware
- **Location**: `app/Http/Middleware/CheckSufficientCredits.php`
- **Function**: Rejects unauthorized requests before they reach the controller.
- **Fail-Closed Policy**: If the cost calculator fails (e.g., file extraction error or system crash), the middleware **automatically denies access** with a `credit_verification_failed` error. This prevents "free" generations during system issues.
- **Logic**:
    1.  Checks if the user is `is_unlimited_student`. If so, permits the request.
    2.  Calculates the request cost using the `CreditCostCalculator` service.
    3.  Fetches user balance from **Redis** (optimized for speed), with a DB fallback.
    4.  If balance < cost, returns a **402 Payment Required** JSON response.

### 2. `CreditCostCalculator` Service
- **Location**: `app/Services/CreditCostCalculator.php`
- **Function**: Centralizes all pricing logic.
- **Features**:
    -   **Scan & Solve**: A minimum floor of 15 credits is assumed (Base 2 + 3+ solutions).
    -   **Quiz Builder**: Calculated as `1 per question` + `5 per 500 words` of content weight.
    -   **Flashcards**: Calculated as `dynamic difficulty-based cost` + `5 per 500 words` of content weight.
    -   **Theory Grading**: Fixed at 2 credits.
    -   **Caching**: Extracts text from uploaded files and caches it in the request object to prevent redundant work in controllers.

### 3. Unified "Unlimited" Alias
- **Location**: `app/Models/User.php`
- **Logic**: Some legacy code checks for `is_unlimited`, while newer logic uses `is_unlimited_student`.
- **Solution**: An attribute alias in the User model ensures that `$user->is_unlimited` always mirrors `$user->is_unlimited_student`. This fixes potential billing bugs without modifying existing controller files.

## Error Response Format
When a request is rejected, the API returns:
```json
{
    "error": "insufficient_credits",
    "message": "Insufficient credits. This action requires X credits, but you only have Y.",
    "required": X,
    "available": Y,
    "shortfall": Z
}
```

## How to Protect a New Route
To protect a new generation endpoint, add the `sufficient.credits` middleware in `routes/api.php`:

```php
Route::post('new/feature', [Controller::class, 'method'])->middleware('sufficient.credits');
```
Then, update `CreditCostCalculator.php` to include the pricing logic for the new path.
