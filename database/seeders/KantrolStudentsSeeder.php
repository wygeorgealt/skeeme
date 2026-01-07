<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Enrollment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class KantrolStudentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find Kantrol Academy
        $school = School::where('name', 'LIKE', '%Kantrol%')->first();
        
        if (!$school) {
            $this->command->error('Kantrol Academy not found. Please create the school first.');
            return;
        }

        $classes = SchoolClass::where('school_id', $school->id)
            ->whereIn('name', ['Grade A', 'Grade B', 'Grade C', 'Grade D'])
            ->get();

        if ($classes->isEmpty()) {
            $this->command->error('Target classes (Grade A, B, C, D) not found in Kantrol Academy.');
            return;
        }

        $students = [
            'Chinedu Okafor',
            'Aisha Bello',
            'Emeka Nwosu',
            'Fatima Abubakar',
            'Tunde Oladipo',
            'Ifeoma Eze',
            'Ibrahim Musa',
            'Adaeze Nnamani',
            'Segun Adebayo',
            'Hauwa Usman',
            'Olusegun Ojo',
            'Chiamaka Onu',
            'Samuel Okeke',
            'Zainab Mohammed',
            'Kunle Adeyemi',
            'Ngozi Obi',
            'Abdullahi Sani',
            'Amaka Ezeani',
            'Bamidele Lawal',
            'Rukayat Yusuf',
            'Michael Eze',
            'Blessing Chukwu',
            'Olumide Akinwale',
            'Halima Ibrahim',
            'Daniel Okoro',
            'Nneka Uche',
            'Femi Olatunji',
            'Maryam Abdullahi',
            'Joshua Nwankwo',
            'Uchechi Ndukwe',
            'Ayodele Afolayan',
            'Amina Abdulkareem',
            'Chukwuemeka Ibe',
            'Folake Adekunle',
            'Samuel Ajayi',
            'Hauwa Bello',
            'Emeka Onwudiwe',
            'Yetunde Olagunju',
            'Ahmed Lawal',
            'Chidinma Nwachukwu',
            'Tobi Olatunde',
            'Mariam Sulaiman',
            'Victor Okoye',
            'Ijeoma Anyanwu',
            'Ibrahim Danjuma',
        ];

        $created = 0;
        $updated = 0;

        foreach ($students as $name) {
            $nameParts = explode(' ', $name, 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? '';
            
            // Generate email from name
            $email = strtolower($firstName . '.' . $lastName) . '@skeeme.com';
            
            $randomClass = $classes->random();

            // Find or create student
            $student = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'password' => Hash::make('password'), // Default password
                    'role' => 'student',
                    'school_id' => $school->id,
                    'class_id' => $randomClass->id,
                    'email_verified_at' => now(),
                    'status' => 'active',
                ]
            );

            if ($student->wasRecentlyCreated) {
                $created++;
                $this->command->info("Created & Assigned: {$name} to {$randomClass->name}");
            } else {
                $updated++;
                $this->command->info("Updated & Assigned: {$name} to {$randomClass->name}");
            }

            // Auto-enroll in all class courses
            $this->enrollInClassCourses($student, $randomClass->id);
        }

        $this->command->info("\n✅ Seeding complete!");
        $this->command->info("Created: {$created} students");
        $this->command->info("Updated: {$updated} students");
        $this->command->info("School: {$school->name}");
    }

    protected function enrollInClassCourses($student, $classId)
    {
        $classCourses = DB::table('class_courses')
            ->where('class_id', $classId)
            ->pluck('course_id');

        foreach ($classCourses as $courseId) {
            Enrollment::firstOrCreate([
                'student_id' => $student->id,
                'course_id' => $courseId,
            ], [
                'class_id' => $classId,
                'enrolled_at' => now(),
            ]);
        }
    }
}
