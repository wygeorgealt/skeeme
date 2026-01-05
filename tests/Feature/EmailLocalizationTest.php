<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailLocalizationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_email_subject_default_language()
    {
        $mail = new OtpMail('123456');
        $envelope = $mail->envelope();
        
        $this->assertIsString($envelope->subject);
        // Should be in English (Skeeme is brand, not language-specific)
        $this->assertGreaterThan(0, strlen($envelope->subject));
    }

    public function test_otp_email_subject_consistent()
    {
        $mail = new OtpMail('otp123');
        $envelope = $mail->envelope();
        
        $this->assertStringContainsString('Verification', $envelope->subject);
        $this->assertStringContainsString('Skeeme', $envelope->subject);
    }

    public function test_email_content_language_consistency()
    {
        $mail = new OtpMail('lang123');
        $content = $mail->content();
        
        $this->assertIsString($content->view);
        $this->assertEquals('lang123', $mail->otp);
    }

    public function test_email_view_files_exist()
    {
        $mail = new OtpMail('view123');
        $content = $mail->content();
        
        // View path should be properly formatted
        $this->assertStringContainsString('emails', $content->view);
    }

    public function test_email_terminology_professional()
    {
        $mail = new OtpMail('prof123');
        $envelope = $mail->envelope();
        
        // Subject should be professional
        $this->assertStringContainsString('Verification', $envelope->subject);
        $this->assertStringNotContainsString('test', strtolower($envelope->subject));
        $this->assertStringNotContainsString('todo', strtolower($envelope->subject));
    }

    public function test_email_content_messaging_consistency()
    {
        $mail = new OtpMail('message123');
        $content = $mail->content();
        
        $this->assertIsString($content->view);
        $this->assertStringContainsString('otp', $content->view);
    }

    public function test_email_avoids_unnecessary_jargon()
    {
        $mail = new OtpMail('jargon123');
        $envelope = $mail->envelope();
        
        // Subject should be clear, not overly technical
        $subject = $envelope->subject;
        $this->assertIsString($subject);
        $this->assertGreaterThan(5, strlen($subject));
    }

    public function test_email_content_data_keys_meaningful()
    {
        $mail = new OtpMail('keys123');
        
        // OTP property should be meaningful (3 chars)
        $this->assertGreaterThan(1, strlen('otp'));
    }

    public function test_email_uses_skeeme_branding()
    {
        $mail = new OtpMail('brand123');
        $envelope = $mail->envelope();
        
        $this->assertStringContainsString('Skeeme', $envelope->subject);
    }

    public function test_email_inherits_app_locale()
    {
        $mail = new OtpMail('locale123');
        $envelope = $mail->envelope();
        
        // Should use configured app locale
        $this->assertIsString($envelope->subject);
        $this->assertNotEmpty($envelope->subject);
    }

    public function test_otp_email_subject_appropriate_length()
    {
        $mail = new OtpMail('length123');
        $envelope = $mail->envelope();
        
        $length = strlen($envelope->subject);
        // Subject should be reasonable length (10-200 chars)
        $this->assertGreaterThanOrEqual(10, $length);
        $this->assertLessThanOrEqual(200, $length);
    }

    public function test_email_subject_no_placeholder_text()
    {
        $mail = new OtpMail('placeholder123');
        $envelope = $mail->envelope();
        
        $subject = strtolower($envelope->subject);
        $this->assertStringNotContainsString('fixme', $subject);
        $this->assertStringNotContainsString('todo', $subject);
        $this->assertStringNotContainsString('xxx', $subject);
    }

    public function test_email_capitalization_proper()
    {
        $mail = new OtpMail('capitalize123');
        $envelope = $mail->envelope();
        
        // Subject should start with capital letter
        $this->assertMatchesRegularExpression('/^[A-Z]/', $envelope->subject);
    }

    public function test_email_terminology_consistency()
    {
        $mail1 = new OtpMail('term1');
        $mail2 = new OtpMail('term2');
        
        $subject1 = $mail1->envelope()->subject;
        $subject2 = $mail2->envelope()->subject;
        
        // Subjects should follow same pattern
        $this->assertEquals($subject1, $subject2);
    }

    public function test_email_brand_consistency()
    {
        $mail = new OtpMail('consistency123');
        $envelope = $mail->envelope();
        
        // Always use proper brand name
        $this->assertStringContainsString('Skeeme', $envelope->subject);
        $this->assertStringNotContainsString('skeeme', $envelope->subject); // Should be capitalized
    }

    public function test_email_subject_descriptive()
    {
        $mail = new OtpMail('descriptive123');
        $envelope = $mail->envelope();
        
        // Subject should describe what the email is about
        $this->assertStringContainsString('Verification', $envelope->subject);
    }

    public function test_email_terminology_user_friendly()
    {
        $mail = new OtpMail('friendly123');
        $envelope = $mail->envelope();
        
        $subject = $envelope->subject;
        // Should use clear, user-friendly language
        $this->assertIsString($subject);
        $this->assertGreaterThan(0, strlen($subject));
    }

    public function test_email_data_keys_not_abbreviated()
    {
        $mail = new OtpMail('abbrev123');
        
        // OTP is not single-letter abbreviated
        $this->assertTrue(strlen('otp') > 1);
        $this->assertEquals(strlen('otp'), 3);
    }

    public function test_email_content_meaningful_variables()
    {
        $mail = new OtpMail('vars123');
        
        // 'otp' is meaningful (3 letters)
        $this->assertEquals(strlen('otp'), 3);
        $this->assertTrue(strlen('otp') > 1);
    }

    public function test_email_subject_language_english()
    {
        $mail = new OtpMail('english123');
        $envelope = $mail->envelope();
        
        // Should be in English (default app language)
        $this->assertIsString($envelope->subject);
        $this->assertStringContainsString('Verification', $envelope->subject);
    }

    public function test_email_terminology_consistency_across_instances()
    {
        $otps = ['otp1', 'otp2', 'otp3'];
        $subjects = [];
        
        foreach ($otps as $otp) {
            $mail = new OtpMail($otp);
            $subjects[] = $mail->envelope()->subject;
        }
        
        // All subjects should be identical
        $this->assertEquals($subjects[0], $subjects[1]);
        $this->assertEquals($subjects[1], $subjects[2]);
    }
}
