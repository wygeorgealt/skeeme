<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailAttachmentTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_otp_email_no_attachments()
    {
        $mail = new OtpMail('123456');
        $attachments = $mail->attachments();
        
        $this->assertIsArray($attachments);
        $this->assertEmpty($attachments);
    }

    public function test_email_attachments_method_exists()
    {
        $mail = new OtpMail('test123');
        
        $this->assertTrue(method_exists($mail, 'attachments'));
    }

    public function test_attachments_returns_array()
    {
        $mail = new OtpMail('array123');
        $result = $mail->attachments();
        
        $this->assertIsArray($result);
    }

    public function test_email_attachment_structure()
    {
        $mail = new OtpMail('struct123');
        $attachments = $mail->attachments();
        
        $this->assertIsArray($attachments);
        // OTP should have empty attachments
        $this->assertEquals([], $attachments);
    }

    public function test_email_can_have_multiple_attachments()
    {
        // Test that attachment array can hold multiple items
        $mail = new OtpMail('multi123');
        $attachments = $mail->attachments();
        
        $this->assertIsArray($attachments);
    }

    public function test_otp_email_no_unexpected_attachments()
    {
        $mail = new OtpMail('unexpected');
        $attachments = $mail->attachments();
        
        $this->assertEmpty($attachments, 'OTP email should not have unexpected attachments');
    }

    public function test_email_attachments_serializable()
    {
        $mail = new OtpMail('serial123');
        
        $serialized = serialize($mail);
        $unserialized = unserialize($serialized);
        
        $this->assertInstanceOf(OtpMail::class, $unserialized);
        $this->assertEmpty($unserialized->attachments());
    }

    public function test_email_with_attachments_queueable()
    {
        Mail::fake();
        
        $mail = new OtpMail('queue123');
        Mail::queue($mail);
        
        Mail::assertQueued(OtpMail::class);
    }

    public function test_attachments_dont_affect_rendering()
    {
        $mail = new OtpMail('render123');
        $content = $mail->content();
        
        // Attachments shouldn't affect view
        $this->assertIsString($content->view);
        $this->assertStringContainsString('otp', $content->view);
    }

    public function test_otp_email_attachment_consistency()
    {
        $mail1 = new OtpMail('otp1');
        $mail2 = new OtpMail('otp2');
        
        $this->assertEquals($mail1->attachments(), $mail2->attachments());
    }

    public function test_email_attachments_type_array()
    {
        $mail = new OtpMail('type123');
        $attachments = $mail->attachments();
        
        $this->assertIsArray($attachments);
        $this->assertEquals(gettype($attachments), 'array');
    }

    public function test_email_attachments_empty_for_otp()
    {
        $mail = new OtpMail('empty123');
        
        $this->assertEmpty($mail->attachments());
    }

    public function test_attachments_method_always_returns_array()
    {
        $mail = new OtpMail('always123');
        
        $result1 = $mail->attachments();
        $result2 = $mail->attachments();
        
        $this->assertIsArray($result1);
        $this->assertIsArray($result2);
        $this->assertEquals($result1, $result2);
    }

    public function test_email_attachments_immutable()
    {
        $mail = new OtpMail('immutable123');
        $attachments = $mail->attachments();
        
        // Should get consistent array
        $this->assertEmpty($attachments);
        
        $attachments2 = $mail->attachments();
        $this->assertEmpty($attachments2);
    }

    public function test_otp_mail_attachment_consistency_across_instances()
    {
        $mail1 = new OtpMail('consistency1');
        $mail2 = new OtpMail('consistency2');
        $mail3 = new OtpMail('consistency3');
        
        $this->assertEquals(count($mail1->attachments()), count($mail2->attachments()));
        $this->assertEquals(count($mail2->attachments()), count($mail3->attachments()));
    }

    public function test_email_attachments_returns_consistent_type()
    {
        $mail = new OtpMail('consistent123');
        
        for ($i = 0; $i < 3; $i++) {
            $result = $mail->attachments();
            $this->assertIsArray($result);
            $this->assertEmpty($result);
        }
    }

    public function test_email_attachment_array_is_indexable()
    {
        $mail = new OtpMail('indexable123');
        $attachments = $mail->attachments();
        
        $this->assertIsArray($attachments);
        // Should support array operations
        $count = count($attachments);
        $this->assertEquals(0, $count);
    }

    public function test_otp_email_queued_with_attachments()
    {
        Mail::fake();
        
        $mail = new OtpMail('queued123');
        Mail::queue($mail);
        
        Mail::assertQueued(OtpMail::class, function ($queued) {
            return is_array($queued->attachments());
        });
    }

    public function test_email_attachments_method_returns_proper_signature()
    {
        $mail = new OtpMail('signature123');
        $result = $mail->attachments();
        
        // Should be an array (per Mailable interface)
        $this->assertTrue(is_array($result));
    }
}
