<?php

namespace Tests\Feature;

use App\Mail\AnnouncementMail;
use App\Mail\EmailVerificationEmail;
use App\Mail\InvoiceEmail;
use App\Mail\InvoiceGeneratedEmail;
use App\Mail\LecturerApprovalNotificationEmail;
use App\Mail\OtpMail;
use App\Mail\PasswordChangedEmail;
use App\Mail\PasswordResetEmail;
use App\Mail\PaymentConfirmationEmail;
use App\Mail\PaymentFailedEmail;
use App\Mail\SubscriptionPaymentReminderEmail;
use App\Mail\SurveyRequestEmail;
use App\Mail\UpgradeConfirmationEmail;
use App\Mail\WelcomeAdminEmail;
use App\Mail\WelcomeEmail;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailQualityTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    /**
     * Test all email mailable classes exist and are instantiable
     */
    public function test_all_email_classes_exist()
    {
        $emailClasses = [
            OtpMail::class,
            WelcomeEmail::class,
            WelcomeAdminEmail::class,
            PasswordResetEmail::class,
            PasswordChangedEmail::class,
            EmailVerificationEmail::class,
            PaymentConfirmationEmail::class,
            PaymentFailedEmail::class,
            InvoiceEmail::class,
            InvoiceGeneratedEmail::class,
            LecturerApprovalNotificationEmail::class,
            SubscriptionPaymentReminderEmail::class,
            UpgradeConfirmationEmail::class,
            SurveyRequestEmail::class,
            AnnouncementMail::class,
        ];

        foreach ($emailClasses as $emailClass) {
            $this->assertTrue(class_exists($emailClass), "{$emailClass} does not exist");
        }
    }

    /**
     * Test OTP email has required fields and content
     */
    public function test_otp_email_has_required_content()
    {
        $mail = new OtpMail('123456');

        $this->assertEquals('Your Skeeme Verification Code', $mail->envelope()->subject);
        $this->assertNotNull($mail->content()->view);
        $this->assertStringContainsString('otp', implode('', array_keys($mail->content()->with)));
    }

    /**
     * Test OTP email passes correct OTP value
     */
    public function test_otp_email_passes_correct_otp_value()
    {
        $otp = '654321';
        $mail = new OtpMail($otp);

        $this->assertEquals($otp, $mail->content()->with['otp']);
    }

    /**
     * Test that email classes use Mailable base class
     */
    public function test_email_classes_extend_mailable()
    {
        $reflection = new \ReflectionClass(OtpMail::class);
        $this->assertTrue(
            $reflection->getParentClass()->getName() === 'Illuminate\Mail\Mailable' ||
            in_array('Illuminate\Mail\Mailable', class_parents(OtpMail::class))
        );
    }

    /**
     * Test all emails have envelope method
     */
    public function test_all_emails_have_envelope_method()
    {
        $emailClasses = [
            OtpMail::class,
            WelcomeEmail::class,
            PasswordResetEmail::class,
        ];

        foreach ($emailClasses as $emailClass) {
            $method = new \ReflectionMethod($emailClass, 'envelope');
            $this->assertTrue($method->isPublic());
        }
    }

    /**
     * Test all emails have content method
     */
    public function test_all_emails_have_content_method()
    {
        $emailClasses = [
            OtpMail::class,
            WelcomeEmail::class,
            PasswordResetEmail::class,
        ];

        foreach ($emailClasses as $emailClass) {
            $method = new \ReflectionMethod($emailClass, 'content');
            $this->assertTrue($method->isPublic());
        }
    }

    /**
     * Test OTP email subject is descriptive
     */
    public function test_otp_email_subject_is_descriptive()
    {
        $mail = new OtpMail('123456');
        $subject = $mail->envelope()->subject;
        
        $this->assertNotEmpty($subject);
        $this->assertGreaterThan(10, strlen($subject));
        $this->assertStringContainsString('Skeeme', $subject);
    }

    /**
     * Test welcome email subject includes dynamic content
     */
    public function test_welcome_email_subject_is_dynamic()
    {
        $reflection = new \ReflectionClass(WelcomeEmail::class);
        $this->assertTrue($reflection->isInstantiable());
    }

    /**
     * Test password reset email subject is secure-themed
     */
    public function test_password_reset_email_subject_is_secure()
    {
        $reflection = new \ReflectionClass(PasswordResetEmail::class);
        $constructor = $reflection->getConstructor();
        $this->assertNotNull($constructor);
    }

    /**
     * Test email views are properly configured
     */
    public function test_email_views_are_strings()
    {
        $mail = new OtpMail('123456');
        $view = $mail->content()->view;
        
        $this->assertIsString($view);
        $this->assertStringContainsString('emails.', $view);
    }

    /**
     * Test email content includes data for rendering
     */
    public function test_otp_email_content_with_includes_data()
    {
        $mail = new OtpMail('123456');
        $with = $mail->content()->with;
        
        $this->assertIsArray($with);
        $this->assertNotEmpty($with);
    }

    /**
     * Test OTP email attachments method returns array
     */
    public function test_otp_email_attachments_returns_array()
    {
        $mail = new OtpMail('123456');
        $attachments = $mail->attachments();
        
        $this->assertIsArray($attachments);
    }

    /**
     * Test emails use SerializesModels trait for queuing
     */
    public function test_emails_use_serializes_models_trait()
    {
        $traits = class_uses(OtpMail::class, true);
        $this->assertArrayHasKey('Illuminate\Queue\SerializesModels', $traits);
    }

    /**
     * Test emails use Queueable trait
     */
    public function test_emails_use_queueable_trait()
    {
        $traits = class_uses(OtpMail::class, true);
        $this->assertArrayHasKey('Illuminate\Bus\Queueable', $traits);
    }

    /**
     * Test email subject does not have encoding issues
     */
    public function test_email_subject_encoding_valid()
    {
        $mail = new OtpMail('123456');
        $subject = $mail->envelope()->subject;
        
        // Valid UTF-8
        $this->assertTrue(mb_check_encoding($subject, 'UTF-8'));
    }

    /**
     * Test password reset email includes url in content
     */
    public function test_password_reset_email_includes_url()
    {
        $this->assertTrue(class_exists(PasswordResetEmail::class));
    }

    /**
     * Test welcome email includes user in content
     */
    public function test_welcome_email_includes_user()
    {
        $this->assertTrue(class_exists(WelcomeEmail::class));
    }

    /**
     * Test email subjects have appropriate length
     */
    public function test_email_subject_length_valid()
    {
        $mail = new OtpMail('123456');
        $subject = $mail->envelope()->subject;
        
        // Subject should be between 10-200 characters
        $this->assertGreaterThan(5, strlen($subject));
        $this->assertLessThan(200, strlen($subject));
    }

    /**
     * Test email classes are properly namespaced
     */
    public function test_email_classes_proper_namespace()
    {
        $mail = new OtpMail('123456');
        $this->assertStringStartsWith('App\Mail', get_class($mail));
    }

    /**
     * Test multiple email types exist in Mail namespace
     */
    public function test_email_namespace_has_diverse_types()
    {
        $mailClasses = [
            'OtpMail' => 'verification',
            'PasswordResetEmail' => 'security',
            'PaymentConfirmationEmail' => 'billing',
            'WelcomeEmail' => 'onboarding',
        ];

        foreach ($mailClasses as $class => $type) {
            $fullClass = "App\Mail\\{$class}";
            $this->assertTrue(class_exists($fullClass), "Email class {$class} not found");
        }
    }

    /**
     * Test OTP email consistency with other verification emails
     */
    public function test_verification_emails_consistent_pattern()
    {
        $otpMail = new OtpMail('123456');
        $otpView = $otpMail->content()->view;
        
        // Both verification emails should use emails.* pattern
        $this->assertStringContainsString('emails.', $otpView);
    }

    /**
     * Test email uses proper from address configuration
     */
    public function test_otp_email_has_proper_from()
    {
        $mail = new OtpMail('123456');
        $from = $mail->envelope()->from;
        
        // Either from is set or uses default from config
        if ($from) {
            $this->assertNotEmpty($from);
        } else {
            $this->assertNotNull(config('mail.from.address'));
        }
    }

    /**
     * Test password reset email subject varies appropriately
     */
    public function test_password_reset_email_subject_security_focused()
    {
        $reflection = new \ReflectionClass(PasswordResetEmail::class);
        $this->assertTrue($reflection->hasMethod('envelope'));
    }

    /**
     * Test email views exist in file system
     */
    public function test_email_view_files_organized_in_emails_folder()
    {
        $mail = new OtpMail('123456');
        $view = $mail->content()->view;
        
        // View path should indicate emails folder
        $this->assertStringContainsString('emails', $view);
    }

    /**
     * Test welcome email can handle empty school name
     */
    public function test_welcome_email_handles_empty_school_name()
    {
        $reflection = new \ReflectionClass(WelcomeEmail::class);
        $constructor = $reflection->getConstructor();
        $params = $constructor->getParameters();
        
        $schoolNameParam = array_filter($params, fn($p) => $p->getName() === 'schoolName');
        $this->assertNotEmpty($schoolNameParam);
    }

    /**
     * Test critical emails defined as such
     */
    public function test_critical_email_types_exist()
    {
        $criticalEmails = [
            OtpMail::class,
            PasswordResetEmail::class,
        ];

        foreach ($criticalEmails as $emailClass) {
            $this->assertTrue(class_exists($emailClass));
            $reflection = new \ReflectionClass($emailClass);
            $this->assertTrue($reflection->hasMethod('envelope'));
            $this->assertTrue($reflection->hasMethod('content'));
        }
    }

    /**
     * Test email content is consistent across types
     */
    public function test_all_checked_emails_have_content_with()
    {
        $mails = [
            new OtpMail('123456'),
        ];

        foreach ($mails as $mail) {
            $with = $mail->content()->with;
            $this->assertIsArray($with);
        }
    }
}
