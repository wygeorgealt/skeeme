<?php

namespace Tests\Feature;

use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Mailable;
use Tests\TestCase;

class EmailRenderingAndDeliveryTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    public function test_otp_email_subject_renders()
    {
        $mail = new OtpMail('123456');
        $envelope = $mail->envelope();
        
        $this->assertIsString($envelope->subject);
        $this->assertStringContainsString('Verification', $envelope->subject);
    }

    public function test_email_envelope_structure()
    {
        $mail = new OtpMail('111111');
        $envelope = $mail->envelope();
        
        $this->assertNotNull($envelope);
        $this->assertIsString($envelope->subject);
        $this->assertGreaterThan(0, strlen($envelope->subject));
    }

    public function test_email_content_structure()
    {
        $mail = new OtpMail('222222');
        $content = $mail->content();
        
        $this->assertNotNull($content);
        $this->assertIsString($content->view);
        $this->assertStringContainsString('otp', $content->view);
    }

    public function test_email_data_passed_to_view()
    {
        $otp = '333333';
        $mail = new OtpMail($otp);
        
        $this->assertEquals($otp, $mail->otp);
        
        $content = $mail->content();
        $this->assertIsString($content->view);
    }

    public function test_email_can_be_sent_through_facade()
    {
        Mail::fake();
        Mail::send(new OtpMail('444444'));
        
        Mail::assertSent(OtpMail::class);
    }

    public function test_otp_email_is_queueable()
    {
        $mail = new OtpMail('555555');
        
        $this->assertTrue(method_exists($mail, 'onConnection'));
        $this->assertTrue(method_exists($mail, 'onQueue'));
        $this->assertTrue(method_exists($mail, 'delay'));
    }

    public function test_email_queue_connection_setting()
    {
        $mail = new OtpMail('666666');
        $queued = $mail->onConnection('database');
        
        $this->assertInstanceOf(Mailable::class, $queued);
    }

    public function test_email_queue_delay_setting()
    {
        $mail = new OtpMail('777777');
        $delayed = $mail->delay(60);
        
        $this->assertInstanceOf(Mailable::class, $delayed);
    }

    public function test_multiple_emails_queued()
    {
        Mail::fake();
        
        Mail::queue(new OtpMail('111111'));
        Mail::queue(new OtpMail('222222'));
        Mail::queue(new OtpMail('333333'));
        
        Mail::assertQueued(OtpMail::class, 3);
    }

    public function test_email_attachments_is_array()
    {
        $mail = new OtpMail('000000');
        $attachments = $mail->attachments();
        
        $this->assertIsArray($attachments);
    }

    public function test_otp_email_subject_contains_brand()
    {
        $mail = new OtpMail('abc123');
        $envelope = $mail->envelope();
        
        $this->assertStringContainsString('Skeeme', $envelope->subject);
    }

    public function test_email_delivery_chain_operations()
    {
        $mail = new OtpMail('chain123');
        
        $chained = $mail->onConnection('sync')->onQueue('emails');
        $this->assertInstanceOf(Mailable::class, $chained);
    }

    public function test_email_implements_mailable_interface()
    {
        $mail = new OtpMail('interface');
        
        $this->assertInstanceOf(Mailable::class, $mail);
        $this->assertTrue(method_exists($mail, 'envelope'));
        $this->assertTrue(method_exists($mail, 'content'));
        $this->assertTrue(method_exists($mail, 'attachments'));
    }

    public function test_email_content_data_accessible()
    {
        $mail = new OtpMail('access123');
        
        $this->assertEquals('access123', $mail->otp);
        
        $content = $mail->content();
        $this->assertIsString($content->view);
    }

    public function test_email_view_properly_configured()
    {
        $mail = new OtpMail('config123');
        $content = $mail->content();
        
        $this->assertIsString($content->view);
        $this->assertTrue(strlen($content->view) > 0);
        $this->assertStringContainsString('otp', $content->view);
    }

    public function test_email_envelope_subject_not_empty()
    {
        $mail = new OtpMail('subject123');
        $envelope = $mail->envelope();
        
        $this->assertTrue(strlen($envelope->subject) > 0);
        $this->assertFalse(empty($envelope->subject));
    }

    public function test_email_queue_with_queue_name()
    {
        $mail = new OtpMail('queue123');
        $queued = $mail->onQueue('emails');
        
        $this->assertInstanceOf(Mailable::class, $queued);
    }

    public function test_email_connection_setting_via_chain()
    {
        $mail = new OtpMail('conn123');
        $connected = $mail->onConnection('sync');
        
        $this->assertInstanceOf(Mailable::class, $connected);
    }

    public function test_email_queueable_trait_methods()
    {
        $mail = new OtpMail('trait123');
        
        $this->assertTrue(method_exists($mail, 'onConnection'));
        $this->assertTrue(method_exists($mail, 'onQueue'));
        $this->assertTrue(method_exists($mail, 'delay'));
        $this->assertTrue(method_exists($mail, 'withoutDelay'));
    }

    public function test_email_serializable_for_queue()
    {
        $mail = new OtpMail('serialize123');
        
        $serialized = serialize($mail);
        $this->assertIsString($serialized);
        $this->assertGreaterThan(0, strlen($serialized));
    }

    public function test_email_deserialization_from_queue()
    {
        $otp = 'deserialize123';
        $mail = new OtpMail($otp);
        
        $serialized = serialize($mail);
        $unserialized = unserialize($serialized);
        
        $this->assertInstanceOf(OtpMail::class, $unserialized);
        $this->assertEquals($otp, $unserialized->otp);
    }

    public function test_email_sent_through_mail_facade()
    {
        Mail::fake();
        
        $mail = new OtpMail('send123');
        Mail::send($mail);
        
        Mail::assertSent(OtpMail::class);
    }

    public function test_email_queued_through_mail_facade()
    {
        Mail::fake();
        
        $mail = new OtpMail('queue456');
        Mail::queue($mail);
        
        Mail::assertQueued(OtpMail::class);
    }

    public function test_email_subject_is_non_empty_string()
    {
        $mail = new OtpMail('subject789');
        $envelope = $mail->envelope();
        
        $this->assertNotEmpty($envelope->subject);
        $this->assertIsString($envelope->subject);
    }

    public function test_email_view_path_structure()
    {
        $mail = new OtpMail('view123');
        $content = $mail->content();
        
        $this->assertStringContainsString('emails', $content->view);
    }

    public function test_otp_data_persistence()
    {
        $otp = 'persist789';
        $mail = new OtpMail($otp);
        
        $this->assertEquals($otp, $mail->otp);
        
        $content = $mail->content();
        $this->assertIsString($content->view);
    }

    public function test_email_has_multiple_queueable_methods()
    {
        $mail = new OtpMail('queue999');
        
        $queued = $mail->onQueue('emails')->delay(30)->onConnection('sync');
        $this->assertInstanceOf(Mailable::class, $queued);
    }

    public function test_email_content_view_is_string()
    {
        $mail = new OtpMail('string456');
        $content = $mail->content();
        
        $this->assertIsString($content->view);
    }

    public function test_email_can_be_queued_multiple_times()
    {
        Mail::fake();
        
        for ($i = 0; $i < 5; $i++) {
            Mail::queue(new OtpMail('otp' . $i));
        }
        
        Mail::assertQueued(OtpMail::class, 5);
    }
}
