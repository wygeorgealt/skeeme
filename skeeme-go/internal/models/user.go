package models

import (
	"database/sql"
	"encoding/json"
)

type User struct {
	ID                     int64          `db:"id" json:"id"`
	RCAppUserID            sql.NullString `db:"rc_app_user_id" json:"rc_app_user_id"`
	Name                   string         `db:"name" json:"name"`
	Email                  string         `db:"email" json:"email"`
	EmailVerifiedAt        sql.NullTime   `db:"email_verified_at" json:"email_verified_at"`
	Password               string         `db:"password" json:"-"`
	Provider               sql.NullString `db:"provider" json:"provider"`
	ProviderID             sql.NullString `db:"provider_id" json:"provider_id"`
	Avatar                 sql.NullString `db:"avatar" json:"avatar"`
	AIPreferences          json.RawMessage `db:"ai_preferences" json:"ai_preferences"` // JSONB
	TwoFactorSecret        sql.NullString `db:"two_factor_secret" json:"-"`
	TwoFactorRecoveryCodes sql.NullString `db:"two_factor_recovery_codes" json:"-"`
	TwoFactorConfirmedAt   sql.NullTime   `db:"two_factor_confirmed_at" json:"two_factor_confirmed_at"`
	RememberToken          sql.NullString `db:"remember_token" json:"-"`
	ExpoPushToken          sql.NullString `db:"expo_push_token" json:"expo_push_token"`
	NotificationsEnabled   bool           `db:"notifications_enabled" json:"notifications_enabled"`
	ReferralCode           sql.NullString `db:"referral_code" json:"referral_code"`
	LastCreditAlertAt      sql.NullTime   `db:"last_credit_alert_at" json:"last_credit_alert_at"`
	Timezone               string         `db:"timezone" json:"timezone"`
	CreatedAt              sql.NullTime   `db:"created_at" json:"created_at"`
	UpdatedAt              sql.NullTime   `db:"updated_at" json:"updated_at"`
	SchoolID               sql.NullInt64  `db:"school_id" json:"school_id"`
	ApprovedBy             sql.NullInt64  `db:"approved_by" json:"approved_by"`
	ApprovedAt             sql.NullTime   `db:"approved_at" json:"approved_at"`
	Role                   sql.NullString `db:"role" json:"role"`
	Status                 string         `db:"status" json:"status"`
	Credits                int            `db:"credits" json:"credits"`
	SubscriptionTier       string         `db:"subscription_tier" json:"subscription_tier"`
	DailyFreeScansUsed     int            `db:"daily_free_scans_used" json:"daily_free_scans_used"`
	LastFreeScanAt         sql.NullTime   `db:"last_free_scan_at" json:"last_free_scan_at"`
	LastCreditRefillAt     sql.NullTime   `db:"last_credit_refill_at" json:"last_credit_refill_at"`
	CreditsEmptiedAt       sql.NullTime   `db:"credits_emptied_at" json:"credits_emptied_at"`
	IsFlagged              bool           `db:"is_flagged" json:"is_flagged"`
	FlagReason             sql.NullString `db:"flag_reason" json:"flag_reason"`
	IsVip                  bool           `db:"is_vip" json:"is_vip"`
	IsBetaTester           bool           `db:"is_beta_tester" json:"is_beta_tester"`
	IsBanned               bool           `db:"is_banned" json:"is_banned"`
	BanReason              sql.NullString `db:"ban_reason" json:"ban_reason"`
	CustomApiLimit         sql.NullInt64  `db:"custom_api_limit" json:"custom_api_limit"`
	PreferredAiModel       sql.NullString `db:"preferred_ai_model" json:"preferred_ai_model"`
	FirstName              sql.NullString `db:"first_name" json:"first_name"`
	LastName               sql.NullString `db:"last_name" json:"last_name"`
	PhoneNumber            sql.NullString `db:"phone_number" json:"phone_number"`
	MiddleName             sql.NullString `db:"middle_name" json:"middle_name"`
	Address                sql.NullString `db:"address" json:"address"`
	ParentToken            sql.NullString `db:"parent_token" json:"parent_token"`
	ClassID                sql.NullInt64  `db:"class_id" json:"class_id"`
	Dob                    sql.NullTime   `db:"dob" json:"dob"`
	Age                    sql.NullInt64  `db:"age" json:"age"`
}
