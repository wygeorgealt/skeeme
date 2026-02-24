<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\School;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Livewire\Livewire;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminOnboardingTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a test user and authenticate with a unique email
        $user = User::factory()->create([
            'email' => 'admin_' . uniqid() . '@example.com',
            'role' => null,
            'school_id' => null,
        ]);

        Auth::login($user);

        // Set session role for admin
        Session::put('registration_role', 'admin');
    }

    #[Test]
    public function test_phone_number_field_is_present_in_step_1()
    {
        Livewire::test(\App\Livewire\AdminOnboarding::class)
            ->assertSet('step', 1)
            ->assertSet('phoneNumber', '')
            ->assertSet('countryCode', '+234');
    }

    #[Test]
    public function test_country_code_options_are_available()
    {
        $component = new \App\Livewire\AdminOnboarding();

        $countryCodes = $component->getCountryCodeOptions();

        $this->assertIsArray($countryCodes);
        $this->assertArrayHasKey('+234', $countryCodes);
        $this->assertArrayHasKey('+1', $countryCodes);
        $this->assertArrayHasKey('+44', $countryCodes);
        $this->assertEquals('Nigeria (+234)', $countryCodes['+234']);
    }

    #[Test]
    public function test_phone_number_validation_passes_with_valid_input()
    {
        Livewire::test(\App\Livewire\AdminOnboarding::class)
            ->set('schoolName', 'Test School')
            ->set('firstName', 'John')
            ->set('lastName', 'Doe')
            ->set('phoneNumber', '1234567890')
            ->set('countryCode', '+1')
            ->call('nextStep')
            ->assertHasNoErrors(['schoolName', 'firstName', 'lastName', 'phoneNumber', 'countryCode']);
    }

    #[Test]
    public function test_phone_number_validation_fails_with_invalid_input()
    {
        Livewire::test(\App\Livewire\AdminOnboarding::class)
            ->set('schoolName', 'Test School')
            ->set('firstName', 'John')
            ->set('lastName', 'Doe')
            ->set('phoneNumber', 'invalid-phone')
            ->set('countryCode', '+1')
            ->call('nextStep')
            ->assertHasErrors(['phoneNumber']);
    }

    #[Test]
    public function test_phone_number_is_saved_during_free_plan_completion()
    {
        Livewire::test(\App\Livewire\AdminOnboarding::class)
            ->set('schoolName', 'Test School')
            ->set('firstName', 'John')
            ->set('lastName', 'Doe')
            ->set('phoneNumber', '1234567890')
            ->set('countryCode', '+1')
            ->set('academicYear', '2024/2025')
            ->set('timezone', 'America/New_York')
            ->set('theme', 'light')
            ->call('nextStep') // Step 1 to 2
            ->call('nextStep') // Step 2 to 3
            ->call('selectPlan', 'free');

        // Check that user was updated with phone number
        $user = Auth::user()->fresh();
        $this->assertEquals('+11234567890', $user->phone_number);
        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('John', $user->first_name);
        $this->assertEquals('Doe', $user->last_name);

        // Check that school was created
        $this->assertNotNull($user->school_id);
        $school = School::find($user->school_id);
        $this->assertNotNull($school);
        $this->assertEquals('Test School', $school->name);
    }

    #[Test]
    public function test_phone_number_is_saved_during_pro_plan_billing_selection()
    {
        Livewire::test(\App\Livewire\AdminOnboarding::class)
            ->set('schoolName', 'Test School')
            ->set('firstName', 'John')
            ->set('lastName', 'Doe')
            ->set('phoneNumber', '1234567890')
            ->set('countryCode', '+1')
            ->set('academicYear', '2024/2025')
            ->set('timezone', 'America/New_York')
            ->set('theme', 'light')
            ->call('nextStep') // Step 1 to 2
            ->call('nextStep') // Step 2 to 3
            ->call('selectPlan', 'pro');

        // Check that user was updated with phone number during billing selection
        $user = Auth::user()->fresh();
        $this->assertEquals('+11234567890', $user->phone_number);
        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('John', $user->first_name);
        $this->assertEquals('Doe', $user->last_name);

        // Check that school was created
        $this->assertNotNull($user->school_id);
        $school = School::find($user->school_id);
        $this->assertNotNull($school);
        $this->assertEquals('Test School', $school->name);
    }

    #[Test]
    public function test_phone_number_is_cleared_when_canceling_pro_plan()
    {
        Livewire::test(\App\Livewire\AdminOnboarding::class)
            ->set('schoolName', 'Test School')
            ->set('firstName', 'John')
            ->set('lastName', 'Doe')
            ->set('phoneNumber', '1234567890')
            ->set('countryCode', '+1')
            ->set('academicYear', '2024/2025')
            ->set('timezone', 'America/New_York')
            ->set('theme', 'light')
            ->call('nextStep') // Step 1 to 2
            ->call('nextStep') // Step 2 to 3
            ->call('selectPlan', 'pro')
            ->call('closeBillingPeriodModal');

        // Check that user phone number was cleared
        $user = Auth::user()->fresh();
        $this->assertNull($user->phone_number);
        $this->assertNull($user->school_id);
        $this->assertNull($user->first_name);
        $this->assertNull($user->last_name);
    }

    #[Test]
    public function test_render_method_passes_country_codes_to_view()
    {
        Livewire::test(\App\Livewire\AdminOnboarding::class)
            ->assertViewHas('countryCodes', function ($countryCodes) {
                return is_array($countryCodes) &&
                       array_key_exists('+234', $countryCodes) &&
                       array_key_exists('+1', $countryCodes);
            });
    }


    #[Test]
    #[DataProvider('countryCodeProvider')]
    public function test_different_country_codes_work_correctly($countryCode, $phoneNumber, $expected)
    {
        Livewire::test(\App\Livewire\AdminOnboarding::class)
            ->set('schoolName', 'Test School')
            ->set('firstName', 'John')
            ->set('lastName', 'Doe')
            ->set('phoneNumber', $phoneNumber)
            ->set('countryCode', $countryCode)
            ->set('academicYear', '2024/2025')
            ->set('timezone', 'America/New_York')
            ->set('theme', 'light')
            ->call('nextStep') // Step 1 to 2
            ->call('nextStep') // Step 2 to 3
            ->call('selectPlan', 'free');

        $user = Auth::user()->fresh();
        $this->assertEquals($expected, $user->phone_number);
    }

    public static function countryCodeProvider(): array
    {
        return [
            'US' => ['+1', '5551234567', '+15551234567'],
            'UK' => ['+44', '7912345678', '+447912345678'],
            'Nigeria' => ['+234', '8031234567', '+2348031234567'],
        ];
    }
}
