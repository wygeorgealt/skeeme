<?php

namespace App\Services;

class SkeemyTutorials
{
    public static function get(string $topic): ?array
    {
        $tutorials = [
            'create_exam' => [
                'title' => 'How to Create an Exam',
                'steps' => [
                    'Go to the **Lecturer Dashboard**.',
                    'Click on **My Exams** in the sidebar.',
                    'Click the **Create Exam** button (top right).',
                    'Fill in the exam details (Title, Course, Duration).',
                    'Click **Save & Continue** to enter the Question Editor.',
                    'Use the **AI Generator** or **Manual Add** to build your questions.',
                    'Click **Publish** when you represent ready.'
                ],
                'link' => route('lecturer.exams'),
                'link_text' => 'Go to Exams'
            ],
            'add_student' => [
                'title' => 'How to Add a Student',
                'steps' => [
                    'Go to **Students Management**.',
                    'Click **Add Student**.',
                    'Enter the student\'s details (Name, Email).',
                    'Skeemy can auto-generate the ID for you!',
                    'Click **Save**.'
                ],
                'tip' => 'Pro Tip: You can ask me to "Create 20 students" to do this in bulk!',
                'link' => route('students-management'),
                'link_text' => 'Go to Students'
            ],
            'create_class' => [
                'title' => 'How to Create a Class',
                'steps' => [
                    'Navigate to **Classes Management**.',
                    'Click **Add Class**.',
                    'Enter a name (e.g., "Grade 10A").',
                    'Click **Create**.'
                ],
                'link' => route('classes-management'),
                'link_text' => 'Go to Classes'
            ],
            'promote_students' => [
                'title' => 'How to Move Students (Promotion)',
                'steps' => [
                    'Go to the **Classes Management** page.',
                    'Click on the specific class (e.g., "Grade 10").',
                    'In the **Students** list, locate the student you want to move.',
                    'Click the **Action Menu** (three dots) next to their name.',
                    'Select **Move to Class**.',
                    'Choose the new class from the dropdown and confirm.',
                    'The student and their course enrollments will be updated automatically.'
                ],
                'tip' => 'This is great for end-of-year promotions or correcting class assignments.',
                'link' => route('classes-management'),
                'link_text' => 'Go to Classes'
            ],
            'assign_courses_class' => [
                'title' => 'Assigning Courses to a Class',
                'steps' => [
                    'Navigate to **Classes Management** and open a class.',
                    'Scroll down to the **Courses** section.',
                    'Click the **Assign Course** button.',
                    'Select a course from the list (e.g., "Mathematics").',
                    'Click **Assign**.',
                    'All students in this class will be automatically enrolled in this course.'
                ]
            ],
            'upload_notes' => [
                'title' => 'Uploading Lecture Notes',
                'steps' => [
                    'Go to **My Courses** as a Lecturer.',
                    'Select the course you want to add materials to.',
                    'Click the **Upload Material** button.',
                    'Select your file (PDF, DOCX, etc.).',
                    'These notes are essential for the AI to understand your curriculum!'
                ]
            ],
            'ai_exam_generator' => [
                'title' => 'Using the AI Question Generator',
                'steps' => [
                    'Create or Edit an Exam in **My Exams**.',
                    'Go to the **Questions** tab.',
                    'Click on the **AI Generator** sub-tab.',
                    'Select the source material (uploaded notes).',
                    'Choose the number of questions and difficulty.',
                    'Click **Generate**.',
                    'Review the questions and click **Add** to insert them into your exam.'
                ],
                'tip' => 'Upload good quality notes for the best questions!'
            ]
        ];

        return $tutorials[$topic] ?? null;
    }
    
    public static function search(string $query): ?array
    {
        // Simple keyword matching (enhanced)
        $query = strtolower($query);
        
        // Exams
        if (str_contains($query, 'exam') || str_contains($query, 'test')) {
             if (str_contains($query, 'ai') || str_contains($query, 'generate')) return self::get('ai_exam_generator');
             return self::get('create_exam');
        }
        
        // Students
        if (str_contains($query, 'student')) {
            if (str_contains($query, 'move') || str_contains($query, 'promote')) return self::get('promote_students');
            if (str_contains($query, 'add') || str_contains($query, 'create')) return self::get('add_student');
        } 
        
        // Classes
        if (str_contains($query, 'class')) {
             if (str_contains($query, 'assign') || str_contains($query, 'course')) return self::get('assign_courses_class');
             if (str_contains($query, 'add') || str_contains($query, 'create')) return self::get('create_class');
        }
        
        // Courses
        if (str_contains($query, 'assign') && str_contains($query, 'course')) return self::get('assign_courses_class');
        
        // Materials
        if (str_contains($query, 'note') || str_contains($query, 'material') || str_contains($query, 'upload')) return self::get('upload_notes');
        
        return null;
    }
}
