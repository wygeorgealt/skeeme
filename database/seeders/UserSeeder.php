<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo schools if they don't exist
        $demoSchool = School::firstOrCreate(
            ['email' => 'demo@school.com'],
            [
                'name' => 'Demo School',
                'address' => '123 Education Street',
                'phone' => '+1234567890',
                'academic_year' => '2024-2025',
                'allow_student_password_change' => true,
            ]
        );

        $proSchool = School::firstOrCreate(
            ['email' => 'pro@school.com'],
            [
                'name' => 'Pro School',
                'address' => '456 Learning Avenue',
                'phone' => '+0987654321',
                'academic_year' => '2024-2025',
                'allow_student_password_change' => true,
            ]
        );

        // Create admin users
        /*
        User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Demo Admin',
                'first_name' => 'Demo',
                'last_name' => 'Admin',
                'password' => Hash::make('password'),
                'school_id' => $demoSchool->id,
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'admin@pro.com'],
            [
                'name' => 'Pro Admin',
                'first_name' => 'Pro',
                'last_name' => 'Admin',
                'password' => Hash::make('password'),
                'school_id' => $proSchool->id,
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        */

        // Create lecturer users
        User::firstOrCreate(
            ['email' => 'lecturer1@demo.com'],
            [
                'name' => 'John Lecturer',
                'first_name' => 'John',
                'last_name' => 'Lecturer',
                'password' => Hash::make('password'),
                'school_id' => $demoSchool->id,
                'role' => 'lecturer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'lecturer2@demo.com'],
            [
                'name' => 'Jane Lecturer',
                'first_name' => 'Jane',
                'last_name' => 'Lecturer',
                'password' => Hash::make('password'),
                'school_id' => $demoSchool->id,
                'role' => 'lecturer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'lecturer1@pro.com'],
            [
                'name' => 'Bob Lecturer',
                'first_name' => 'Bob',
                'last_name' => 'Lecturer',
                'password' => Hash::make('password'),
                'school_id' => $proSchool->id,
                'role' => 'lecturer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'lecturer2@pro.com'],
            [
                'name' => 'Carol Lecturer',
                'first_name' => 'Carol',
                'last_name' => 'Lecturer',
                'password' => Hash::make('password'),
                'school_id' => $proSchool->id,
                'role' => 'lecturer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'lecturer3@pro.com'],
            [
                'name' => 'David Lecturer',
                'first_name' => 'David',
                'last_name' => 'Lecturer',
                'password' => Hash::make('password'),
                'school_id' => $proSchool->id,
                'role' => 'lecturer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'lecturer4@pro.com'],
            [
                'name' => 'Emma Lecturer',
                'first_name' => 'Emma',
                'last_name' => 'Lecturer',
                'password' => Hash::make('password'),
                'school_id' => $proSchool->id,
                'role' => 'lecturer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'lecturer5@pro.com'],
            [
                'name' => 'Frank Lecturer',
                'first_name' => 'Frank',
                'last_name' => 'Lecturer',
                'password' => Hash::make('password'),
                'school_id' => $proSchool->id,
                'role' => 'lecturer',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Create student users
        User::firstOrCreate(
            ['email' => 'student1@demo.com'],
            [
                'name' => 'Alice Student',
                'first_name' => 'Alice',
                'last_name' => 'Student',
                'password' => Hash::make('password'),
                'school_id' => $demoSchool->id,
                'role' => 'student',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'student2@demo.com'],
            [
                'name' => 'Charlie Student',
                'first_name' => 'Charlie',
                'last_name' => 'Student',
                'password' => Hash::make('password'),
                'school_id' => $demoSchool->id,
                'role' => 'student',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'student3@demo.com'],
            [
                'name' => 'Diana Student',
                'first_name' => 'Diana',
                'last_name' => 'Student',
                'password' => Hash::make('password'),
                'school_id' => $demoSchool->id,
                'role' => 'student',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'student1@pro.com'],
            [
                'name' => 'Eve Student',
                'first_name' => 'Eve',
                'last_name' => 'Student',
                'password' => Hash::make('password'),
                'school_id' => $proSchool->id,
                'role' => 'student',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'student2@pro.com'],
            [
                'name' => 'Frank Student',
                'first_name' => 'Frank',
                'last_name' => 'Student',
                'password' => Hash::make('password'),
                'school_id' => $proSchool->id,
                'role' => 'student',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        // Create some inactive/suspended users for testing
        User::firstOrCreate(
            ['email' => 'inactive@student.com'],
            [
                'name' => 'Inactive Student',
                'first_name' => 'Inactive',
                'last_name' => 'Student',
                'password' => Hash::make('password'),
                'school_id' => $demoSchool->id,
                'role' => 'student',
                'status' => 'inactive',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'suspended@lecturer.com'],
            [
                'name' => 'Suspended Lecturer',
                'first_name' => 'Suspended',
                'last_name' => 'Lecturer',
                'password' => Hash::make('password'),
                'school_id' => $demoSchool->id,
                'role' => 'lecturer',
                'status' => 'suspended',
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Mock users seeded successfully!');
        $this->command->info('Demo School ID: ' . $demoSchool->id);
        $this->command->info('Pro School ID: ' . $proSchool->id);
        $this->command->info('Login credentials: email/password for all users');
    }
}
