# Exam Question Management System - Implementation Guide

## 📋 Overview
A comprehensive question management system for lecturers to create, manage, and generate exam questions through multiple methods: manual entry, question banks, and AI-powered generation using Deepseek API.

---

## 📁 Files Created/Modified

### Models (Database Layer)
1. **`App\Models\QuestionBank`** - NEW
   - Stores reusable question banks per course
   - Methods: `searchQuestions()`, `questionsByDifficulty()`, `questionsByTopic()`

2. **`App\Models\Question`** - UPDATED
   - Extended with new fields: `question_bank_id`, `difficulty_level`, `topic`, `learning_objective`, `explanation`, `source`, `created_by`
   - Types: Multiple Choice, True/False, Short Answer, Essay, Fill in the Blank

3. **`App\Models\ExamQuestion`** - NEW
   - Junction table linking questions to exams
   - Stores: order, marks per question

4. **`App\Models\Exam`** - UPDATED
   - New relationships: `examQuestions()`, `questions()`

### Migrations
1. **`2025_11_27_000001_create_question_banks_table.php`** - NEW
2. **`2025_11_27_000002_add_question_bank_fields_to_questions.php`** - NEW
3. **`2025_11_27_000003_create_exam_questions_table.php`** - NEW

### Services (Business Logic)
1. **`App\Services\DeepseekAIService`** - NEW
   - Integrates with Deepseek API for question generation
   - Methods:
     - `generateQuestions()` - Generate questions based on materials
     - `testConnection()` - Verify API connection
     - Automatic question type mapping and formatting

### Livewire Components
1. **`App\Livewire\LecturerExamQuestions`** - NEW
   - Main component managing all question operations
   - 4 tabs: Review, Manual Entry, Question Bank, AI Generator
   - Features:
     - Manual question creation with validation
     - Question bank browsing with search/filter
     - AI question generation with batch selection
     - Auto-save to question bank
     - Question preview modal
     - Reordering and marks management

### Views (Blade Templates)
1. **`resources/views/livewire/lecturer-exam-questions.blade.php`** - NEW
   - Main layout with tabs interface

2. **Partials:**
   - `exam-questions-review.blade.php` - Review & manage questions
   - `exam-questions-manual.blade.php` - Manual question creation form
   - `exam-questions-bank.blade.php` - Question bank browser
   - `exam-questions-ai.blade.php` - AI question generator
   - `question-preview-modal.blade.php` - Question preview modal

### Routes
- **`/lecturer/exams/{exam}/questions`** → LecturerExamQuestions component

---

## 🎯 Features

### 1. Manual Question Entry
- Create questions directly with validation
- Support for 5 question types:
  - Multiple Choice (4 options)
  - True/False
  - Short Answer
  - Essay/Long Answer
  - Fill in the Blank
- Set difficulty level (Easy, Medium, Hard)
- Add topic tags and explanations
- Assign marks per question
- Auto-save to course question bank

### 2. Question Bank
- Browse saved questions per course
- Search by question text or topic
- Filter by difficulty level
- Add questions to exam with one click
- View and manage reusable questions

### 3. AI Question Generation
- **Input Methods:**
  - Paste course materials/notes
  - Upload files (PDF, DOCX, TXT)
  - Support multiple notes at once

- **Configuration:**
  - Set number of questions (1-120)
  - Choose difficulty level (Easy, Medium, Hard, Mixed)
  - Select question types to generate
  
- **Features:**
  - Batch selection of generated questions
  - Preview before adding
  - Regenerate if needed
  - Auto-save to question bank

### 4. Review & Management
- View all exam questions
- Drag-to-reorder questions
- Edit marks per question
- Delete questions
- Side-by-side preview
- Calculate total marks automatically

### 5. Question Preview
- Modal with formatted question display
- Shows options with correct answer highlighted
- Displays explanations and learning objectives
- Responsive design

---

## 🔑 Key Features Implementation

### Automatic Question Bank Saving
```php
// When adding questions from any source (manual, AI, etc.)
// Questions are automatically saved to the course's default question bank
$question = Question::create([
    'question_bank_id' => $this->getOrCreateQuestionBank()->id,
    'source' => 'manual|ai_generated|imported',
    // ...
]);
```

### Deepseek AI Integration
```php
// Uses Deepseek API key from .env
$service = new DeepseekAIService();
$questions = $service->generateQuestions(
    $notes,           // Course materials
    120,              // Max questions
    'mixed',          // Difficulty
    $questionTypes    // Selected types
);
```

### Question Reordering
- Uses JavaScript Sortable library
- Drag-and-drop interface
- Automatic order updates

---

## 📊 Data Structure

### Questions Table (Extended)
```
- id (Primary Key)
- question_pool_id (FK) - Legacy support
- question_bank_id (FK) - New
- question_text
- question_type (enum)
- difficulty_level (enum: easy, medium, hard)
- topic
- options (JSON)
- correct_answer
- explanation
- learning_objective
- source (enum: manual, ai_generated, imported)
- created_by (FK)
- bloom_level, metadata, status, usage_count (existing)
```

### Question Banks Table (New)
```
- id
- course_id (FK)
- name
- description
- created_by (FK)
- status (active/archived)
- timestamps
```

### Exam Questions Table (New)
```
- id
- exam_id (FK)
- question_id (FK)
- order
- marks (decimal)
- timestamps
```

---

## 🎨 UI/UX Design

### Tab Navigation
- Color-coded tabs with icons
- Active tab indicator
- Badge showing count (Review tab)

### Question Cards
- Clean, card-based layout
- Question type badges
- Difficulty indicators
- Quick action buttons
- Hover effects

### Forms
- Grouped inputs with clear labels
- Validation error display
- Real-time field updates
- Responsive grid layout

### Modals
- Centered question preview
- Syntax-highlighted options
- Correct answer highlighted in green
- Smooth animations

### Dark Mode Support
- Full dark mode CSS variables
- Consistent color scheme

---

## 🔧 Setup Instructions

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Configure Deepseek API
Add to `.env`:
```
DEEPSEEK_API_KEY=your_api_key_here
```

### 3. Install Dependencies (if needed)
```bash
composer require guzzlehttp/guzzle
```

### 4. Optional: Install Sortable Library
For drag-to-reorder:
```html
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
```

---

## 📝 Usage Workflow

### Creating an Exam with Questions

1. **Create Exam** (in LecturerExams component)
   - Set title, date, duration, total marks
   - Status: Draft

2. **Manage Questions** (click "Manage Questions" button)
   - Opens LecturerExamQuestions component

3. **Add Questions (Choose Method)**
   - **Manual**: Type questions directly
   - **Bank**: Select from existing questions
   - **AI**: Generate from course materials

4. **Review**
   - View all questions
   - Reorder as needed
   - Adjust individual question marks
   - Verify total marks

5. **Publish** (from Review tab)
   - Save and publish exam
   - Questions locked for editing

---

## 🎓 Question Types Support

### Multiple Choice
- 4 options displayed
- Single correct answer
- Options stored in JSON array

### True/False
- 2 options
- Simple correct/incorrect

### Short Answer
- Free text answer
- Lecturer-reviewed

### Essay
- Extended text response
- Suitable for open-ended questions

### Fill in the Blank
- Single/multiple blanks
- Expected answer stored

---

## 🚀 Future Enhancements

1. **Batch Question Import**
   - CSV/Excel import
   - Bulk question upload

2. **Question Analytics**
   - Usage statistics
   - Student performance per question
   - Difficulty calibration

3. **Question Collaboration**
   - Share question banks between lecturers
   - Department-wide question libraries

4. **Advanced AI Features**
   - Custom instructions for AI
   - Question variation generation
   - Automatic answer key generation

5. **Mobile Support**
   - Mobile-optimized question creation
   - On-the-go question bank browsing

---

## ✅ Testing Checklist

- [ ] Create manual questions (all types)
- [ ] Create question bank
- [ ] Add questions to exam
- [ ] Search and filter questions
- [ ] Test AI generation with sample materials
- [ ] Batch select AI questions
- [ ] Preview questions (all types)
- [ ] Reorder questions
- [ ] Edit question marks
- [ ] Save and publish exam
- [ ] Verify total marks calculation
- [ ] Test dark mode
- [ ] Responsive design (mobile, tablet, desktop)

---

## 📞 Support Notes

- All question data is validated server-side
- File uploads processed asynchronously
- AI API errors caught and logged
- Automatic fallback to manual entry if AI fails
- Database transactions ensure data consistency
