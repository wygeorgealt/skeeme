# 🚀 Deployment & Execution Guide

## Pre-Deployment Checklist

### 1. Environment Setup
```bash
# Copy template if needed
cp .env.example .env

# Add Deepseek API key
# Edit .env and add:
DEEPSEEK_API_KEY=your_actual_api_key_here
```

### 2. Database Setup
```bash
# Run migrations to create new tables
php artisan migrate

# If migrations already run, check status:
php artisan migrate:status

# Rollback if needed (careful in production!):
php artisan migrate:rollback --step=3
```

### 3. Clear Caches
```bash
# Clear config cache
php artisan config:clear

# Clear route cache
php artisan route:clear

# Clear view cache
php artisan view:clear

# Or all at once:
php artisan cache:clear
```

### 4. Dependencies
```bash
# Guzzle should already be installed
composer require guzzlehttp/guzzle:^7.0

# Verify installation
php artisan tinker
# Then in tinker: Guzzle\Client
# Should not error
```

---

## Verification Steps

### Step 1: Check Migration Success
```bash
php artisan migrate:status

# Should show all migrations as "Ran"
```

### Step 2: Test Database
```bash
php artisan tinker

# Check tables exist:
>>> Schema::getTables()
>>> Schema::getColumns('questions')
>>> Schema::getColumns('question_banks')
>>> Schema::getColumns('exam_questions')

# Exit tinker:
>>> exit
```

### Step 3: Test Deepseek Connection
```bash
php artisan tinker

>>> $service = new \App\Services\DeepseekAIService();
>>> $service->testConnection()

# Should return true if API key is valid
>>> exit
```

### Step 4: Test Routes
```bash
php artisan route:list | grep exam-questions

# Should show:
# POST /lecturer/exams/{exam}/questions ... LecturerExamQuestions
```

### Step 5: Test Component Loading
```bash
# Start dev server
php artisan serve

# Visit: http://localhost:8000/lecturer/exams

# Create an exam, then click "Manage Questions"
# Should load the new interface
```

---

## File Locations Quick Reference

### Models
```
app/Models/
├── QuestionBank.php (NEW)
├── Question.php (MODIFIED)
├── ExamQuestion.php (NEW)
└── Exam.php (MODIFIED)
```

### Components
```
app/Livewire/
└── LecturerExamQuestions.php (NEW)
```

### Services
```
app/Services/
└── DeepseekAIService.php (NEW)
```

### Views
```
resources/views/livewire/
├── lecturer-exam-questions.blade.php (NEW)
└── partials/
    ├── exam-questions-review.blade.php (NEW)
    ├── exam-questions-manual.blade.php (NEW)
    ├── exam-questions-bank.blade.php (NEW)
    ├── exam-questions-ai.blade.php (NEW)
    └── question-preview-modal.blade.php (NEW)
```

### Migrations
```
database/migrations/
├── 2025_11_27_000001_create_question_banks_table.php (NEW)
├── 2025_11_27_000002_add_question_bank_fields_to_questions.php (NEW)
└── 2025_11_27_000003_create_exam_questions_table.php (NEW)
```

### Routes
```
routes/web.php (MODIFIED)
# Added: Route::get('/lecturer/exams/{exam}/questions', ...)
```

---

## Troubleshooting Commands

### If Migrations Fail
```bash
# Check migration history
php artisan migrate:status

# Rollback one batch
php artisan migrate:rollback

# Rollback specific steps
php artisan migrate:rollback --step=3

# Then re-run
php artisan migrate
```

### If Components Don't Load
```bash
# Clear Livewire cache
php artisan livewire:clear-cache

# Refresh component discovery
php artisan livewire:discover

# Clear all caches
php artisan cache:clear
php artisan view:clear
php artisan config:clear
```

### If Routes Not Found
```bash
# Refresh route cache
php artisan route:clear

# Verify route exists
php artisan route:list | grep exam-questions

# Check web.php syntax
php artisan tinker
# Then: require 'routes/web.php';
```

### If Database Issues
```bash
# Check table exists
php artisan tinker
>>> Schema::hasTable('questions')
>>> Schema::hasTable('question_banks')
>>> Schema::hasTable('exam_questions')

# Check column exists
>>> Schema::hasColumn('questions', 'question_bank_id')
>>> Schema::hasColumn('questions', 'difficulty_level')
```

### If API Not Working
```bash
# Test connection
php artisan tinker
>>> $service = new App\Services\DeepseekAIService();
>>> $service->testConnection()

# Check API key
>>> env('DEEPSEEK_API_KEY')

# Should print your key, not null
```

---

## Development Commands

### Watch Mode (Development)
```bash
# Build frontend assets
npm run dev

# In another terminal, run PHP server
php artisan serve
```

### Seed Test Data (Optional)
```bash
# Create test questions
php artisan tinker

>>> $bank = QuestionBank::factory()->create(['course_id' => 3]);
>>> Question::factory(10)->create(['question_bank_id' => $bank->id]);
>>> exit
```

### Database Inspection
```bash
# Check questions in DB
php artisan tinker
>>> Question::count()
>>> Question::with('questionBank')->first()
>>> QuestionBank::with('questions')->first()
```

---

## Performance Optimization

### Enable Query Caching
```php
// In LecturerExamQuestions.php
// Already using eager loading:
$this->exam->examQuestions()->with('question')->get()
```

### Database Indexes
```sql
-- These are automatically created by migrations, but verify:
SELECT * FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_NAME = 'questions';

-- Should show indexes on:
-- - question_bank_id
-- - question_type
-- - difficulty_level
-- - topic
```

### Query Optimization
```bash
# Enable query logging in local
# In config/database.php or .env:
DB_DEBUG=true

# Then check storage/logs/laravel.log for slow queries
```

---

## Production Deployment

### Pre-Production
```bash
# 1. Test all features locally
php artisan serve
# Navigate to exam management

# 2. Test AI generation
# Create test exam with materials

# 3. Test all tabs
# Manual, Bank, AI, Review

# 4. Run tests (if any)
php artisan test
```

### Production Setup
```bash
# 1. Update .env for production
APP_ENV=production
DEEPSEEK_API_KEY=your_production_key
DB_CONNECTION=mysql
# ... other settings

# 2. Run migrations (if using automated deployment)
php artisan migrate --force

# 3. Optimize autoloader
composer install --optimize-autoloader --no-dev

# 4. Build assets
npm run build

# 5. Cache config
php artisan config:cache

# 6. Cache routes
php artisan route:cache

# 7. Cache views
php artisan view:cache
```

### Backup Before Deployment
```bash
# Backup database
mysqldump -u user -p database_name > backup_$(date +%Y%m%d).sql

# Backup code
tar -czf backup_code_$(date +%Y%m%d).tar.gz .

# Store in safe location
```

---

## Monitoring & Maintenance

### Log Monitoring
```bash
# Watch logs in real-time
tail -f storage/logs/laravel.log

# Search for errors
grep -i "error\|exception" storage/logs/laravel.log

# Count AI errors
grep "Deepseek" storage/logs/laravel.log | wc -l
```

### Database Maintenance
```bash
# Regular backups (weekly)
0 2 * * 0 mysqldump -u user -p database > backup.sql

# Clean old logs (monthly)
find storage/logs -name "*.log" -mtime +30 -delete

# Optimize tables (monthly)
OPTIMIZE TABLE questions, question_banks, exam_questions;
```

### Performance Monitoring
```bash
# Check slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

# Monitor in:
/var/log/mysql/slow.log (on Linux)
```

---

## Rollback Procedures

### If Something Goes Wrong

#### Option 1: Rollback Code
```bash
# See what changed
git log --oneline -5

# Rollback to previous version
git revert HEAD

# Or if not committed yet
git checkout .
```

#### Option 2: Rollback Database
```bash
# Rollback migrations
php artisan migrate:rollback --step=3

# This removes tables:
# - question_banks
# - exam_questions
# - And reverts questions table changes
```

#### Option 3: Full Recovery
```bash
# From backup
mysql -u user -p database_name < backup_20250101.sql

# Or restore files
tar -xzf backup_code_20250101.tar.gz
```

---

## Common Issues & Solutions

### Issue 1: "Class LecturerExamQuestions not found"
```bash
# Solution: Clear Livewire cache
php artisan livewire:clear-cache
php artisan cache:clear
```

### Issue 2: "DEEPSEEK_API_KEY is not set"
```bash
# Solution: Add to .env
DEEPSEEK_API_KEY=sk_...

# Or verify it's there:
php artisan tinker
>>> env('DEEPSEEK_API_KEY')
```

### Issue 3: "Table 'question_banks' doesn't exist"
```bash
# Solution: Run migrations
php artisan migrate

# Or if migration failed:
php artisan migrate:rollback
php artisan migrate
```

### Issue 4: "404 - Route not found"
```bash
# Solution: Clear route cache
php artisan route:clear

# Verify route exists:
php artisan route:list | grep exam-questions
```

### Issue 5: "Questions not saving to bank"
```bash
# Check:
1. question_bank_id is being set
2. created_by is being set (Auth::id())
3. Database errors in laravel.log

# Test directly:
php artisan tinker
>>> $q = Question::create([...])
>>> $q->question_bank_id
```

---

## Feature Toggle (Optional)

### Disable AI Generation Temporarily
```php
// In LecturerExamQuestions.php generateAIQuestions()
if (false) { // Disabled
    // AI code
}
```

### Use Local AI Model (Advanced)
```php
// Alternative to Deepseek - use Ollama
// Update DeepseekAIService to support both
```

---

## Support & Debugging

### Enabling Debug Mode
```bash
# In .env
APP_DEBUG=true

# This shows detailed errors

# In production:
APP_DEBUG=false
```

### Getting Help
1. Check `EXAM_QUESTIONS_IMPLEMENTATION.md`
2. Check `EXAM_QUESTIONS_QUICK_START.md`
3. Review `BUILD_SUMMARY.md`
4. Check Laravel logs: `storage/logs/laravel.log`
5. Check browser console for JS errors (F12)

---

## Timeline Estimate

| Task | Time | Status |
|------|------|--------|
| Run Migrations | 1 min | ⏳ |
| Test Database | 2 min | ⏳ |
| Test API | 1 min | ⏳ |
| Test UI Loading | 2 min | ⏳ |
| Create Test Exam | 5 min | ⏳ |
| Test All Tabs | 10 min | ⏳ |
| Train Lecturers | 15 min | ⏳ |
| **Total** | **~40 min** | |

---

## Go Live Checklist

- [ ] .env configured with API key
- [ ] Migrations run successfully
- [ ] Database verified
- [ ] Routes verified
- [ ] Components load without errors
- [ ] Can create manual questions
- [ ] Can search question bank
- [ ] Can generate AI questions (if API key valid)
- [ ] Can reorder questions
- [ ] Can delete questions
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Tested on multiple browsers
- [ ] Backups created
- [ ] Team trained

---

**✅ Ready to deploy!**
