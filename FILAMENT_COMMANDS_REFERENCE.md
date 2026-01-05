# Filament Implementation - Complete Command Reference

## ✅ Completed Setup

All core setup is complete. The following commands were already run:

```bash
# Initial installation
composer require filament/filament:"^4.0" -W
php artisan filament:install --panels

# Created 3 panels
php artisan make:filament-panel admin
php artisan make:filament-panel student
php artisan make:filament-panel lecturer

# Generated resources for admin panel
php artisan make:filament-resource User --generate --panel=admin
php artisan make:filament-resource Course --generate --panel=admin
php artisan make:filament-resource Enrollment --generate --panel=admin

# Generated admin widget
php artisan make:filament-widget AdminOverview --stats-overview --panel=admin

# Created role middleware
php artisan make:middleware EnsureUserIsAdmin
php artisan make:middleware EnsureUserIsStudent
php artisan make:middleware EnsureUserIsLecturer
```

## 🚀 START HERE - Test Current Setup

```bash
# Clear caches
php artisan cache:clear
php artisan config:clear

# Start development
php artisan serve
# In another terminal:
npm run dev

# Then visit:
# http://localhost:8000/admin
# http://localhost:8000/student
# http://localhost:8000/lecturer
```

---

## 📋 Next: Build Student Panel Resources

Copy and paste these commands one at a time:

```bash
# Create Course resource for students (read-only view of their courses)
php artisan make:filament-resource Course --panel=student

# Create Grade resource for students (view their grades)
php artisan make:filament-resource Grade --panel=student
```

Then customize:
- `app/Filament/Student/Resources/CourseResource.php`
- `app/Filament/Student/Resources/GradeResource.php`

---

## 📋 Next: Build Lecturer Panel Resources

```bash
# Create Course resource for lecturers (manage their courses)
php artisan make:filament-resource Course --panel=lecturer

# Create Grade resource for lecturers (grade submissions)
php artisan make:filament-resource Grade --panel=lecturer

# Optional: Create Exam resource
php artisan make:filament-resource Exam --panel=lecturer
```

Then customize:
- `app/Filament/Lecturer/Resources/CourseResource.php`
- `app/Filament/Lecturer/Resources/GradeResource.php`
- `app/Filament/Lecturer/Resources/ExamResource.php`

---

## 🎨 Create Dashboard Widgets

### Student Dashboard Widget

```bash
php artisan make:filament-widget StudentStats --stats-overview --panel=student
```

Edit `app/Filament/Student/Widgets/StudentStats.php`:
```php
protected function getStats(): array
{
    $user = Auth::user();
    
    return [
        Stat::make('Enrolled Courses', 
            Enrollment::where('student_id', $user->id)->count())
            ->descriptionIcon('heroicon-m-book-open'),
        
        Stat::make('Current GPA', 
            Grade::where('student_id', $user->id)->avg('grade_point') ?? 0)
            ->descriptionIcon('heroicon-m-star'),
        
        Stat::make('Completed Assignments',
            AssignmentSubmission::where('student_id', $user->id)->count())
            ->descriptionIcon('heroicon-m-check-circle'),
    ];
}
```

### Lecturer Dashboard Widget

```bash
php artisan make:filament-widget LecturerStats --stats-overview --panel=lecturer
```

Edit `app/Filament/Lecturer/Widgets/LecturerStats.php`:
```php
protected function getStats(): array
{
    $user = Auth::user();
    
    return [
        Stat::make('Total Courses',
            Course::where('lecturer_id', $user->id)->count())
            ->descriptionIcon('heroicon-m-book-open'),
        
        Stat::make('Total Students',
            Enrollment::whereHas('course', function($q) use ($user) {
                $q->where('lecturer_id', $user->id);
            })->count())
            ->descriptionIcon('heroicon-m-user-group'),
        
        Stat::make('Pending Grades',
            ExamSubmission::whereHas('course', function($q) use ($user) {
                $q->where('lecturer_id', $user->id);
            })->whereNull('grade')->count())
            ->descriptionIcon('heroicon-m-document'),
    ];
}
```

---

## 🔧 Customize Existing Resources

### Improve User Resource Table

Edit `app/Filament/Resources/Users/Tables/UsersTable.php`:

```php
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;

public static function configure(Table $table): Table
{
    return $table
        ->columns([
            TextColumn::make('name')
                ->searchable()
                ->sortable()
                ->weight('bold'),
            TextColumn::make('email')
                ->searchable()
                ->sortable(),
            BadgeColumn::make('role')
                ->colors([
                    'admin' => 'danger',
                    'student' => 'info',
                    'lecturer' => 'success',
                ])
                ->labels([
                    'admin' => 'Admin',
                    'student' => 'Student',
                    'lecturer' => 'Lecturer',
                ]),
            BadgeColumn::make('status')
                ->colors([
                    'active' => 'success',
                    'inactive' => 'warning',
                    'suspended' => 'danger',
                ]),
            TextColumn::make('created_at')
                ->dateTime()
                ->sortable(),
        ])
        ->filters([
            SelectFilter::make('role')
                ->options([
                    'admin' => 'Admin',
                    'student' => 'Student',
                    'lecturer' => 'Lecturer',
                ]),
            SelectFilter::make('status')
                ->options([
                    'active' => 'Active',
                    'inactive' => 'Inactive',
                    'suspended' => 'Suspended',
                ]),
        ])
        ->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\DeleteAction::make(),
        ])
        ->bulkActions([
            Tables\Actions\BulkActionGroup::make([
                Tables\Actions\DeleteBulkAction::make(),
            ]),
        ]);
}
```

### Improve User Form

Edit `app/Filament/Resources/Users/Schemas/UserForm.php`:

```php
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;

public static function configure(Schema $schema): Schema
{
    return $schema
        ->schema([
            Section::make('Personal Information')
                ->columns(2)
                ->schema([
                    TextInput::make('name')
                        ->required()
                        ->maxLength(255),
                    TextInput::make('email')
                        ->email()
                        ->required()
                        ->unique(ignoreRecord: true),
                ]),
            
            Section::make('Account Details')
                ->columns(2)
                ->schema([
                    Select::make('role')
                        ->options([
                            'admin' => 'Admin',
                            'student' => 'Student',
                            'lecturer' => 'Lecturer',
                        ])
                        ->required(),
                    Select::make('status')
                        ->options([
                            'active' => 'Active',
                            'inactive' => 'Inactive',
                            'suspended' => 'Suspended',
                        ])
                        ->required(),
                ]),
        ]);
}
```

---

## 📱 Add Branding to Panels

Update each `PanelProvider`:

### AdminPanelProvider
```php
->brandName('Skeeme')
->logo(asset('images/logo.png'))
->favicon(asset('images/favicon.ico'))
->darkMode(true)
->timezone('Africa/Lagos')
->colors([
    'primary' => Color::Amber,
])
```

### StudentPanelProvider
```php
->brandName('Skeeme - Student')
->logo(asset('images/logo.png'))
->darkMode(true)
->timezone('Africa/Lagos')
->colors([
    'primary' => Color::Blue,
])
```

### LecturerPanelProvider
```php
->brandName('Skeeme - Lecturer')
->logo(asset('images/logo.png'))
->darkMode(true)
->timezone('Africa/Lagos')
->colors([
    'primary' => Color::Green,
])
```

---

## 🧹 Cleanup Commands

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear

# Optimize for production
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 🧪 Testing Commands

```bash
# Run tests
php artisan test

# Run specific test
php artisan test tests/Feature/AdminPanelTest.php

# Generate test coverage
php artisan test --coverage
```

---

## 📦 Asset Building

```bash
# Development
npm run dev

# Production
npm run build

# Watch for changes
npm run watch
```

---

## 🔍 Troubleshooting Commands

```bash
# Check what resources Filament discovered
php artisan filament:list-resources

# Check panel configuration
php artisan filament:show-config admin

# Generate missing pages for resource
php artisan make:filament-page ResourceName/ListRecords --resource=ResourceName

# Force re-discovery of resources
php artisan cache:clear && php artisan config:clear
```

---

## 📝 Create Custom Pages

```bash
# Create dashboard page
php artisan make:filament-page Dashboard --panel=admin --type=dashboard

# Create custom page
php artisan make:filament-page ReportsPage --panel=admin

# Create page with resource
php artisan make:filament-page ViewUsers --resource=UserResource --panel=admin
```

---

## 🎯 Common Customization Commands

```bash
# Create relation manager for resource
php artisan make:filament-relation-manager UserResource posts title --panel=admin

# Create form component
php artisan make:filament-form-component CustomField

# Create table column
php artisan make:filament-table-column CustomColumn

# Create action
php artisan make:filament-action CustomAction --panel=admin
```

---

## 📚 Documentation Commands

```bash
# View Filament help
php artisan help filament:list-resources

# List all filament commands
php artisan list filament

# Check panel info
php artisan filament:info
```

---

## ✨ Quick Wins (Easy Wins First)

1. **Test Admin Panel** (5 min)
   ```bash
   php artisan serve
   # Visit http://localhost:8000/admin
   ```

2. **Customize User Table** (15 min)
   - Edit `app/Filament/Resources/Users/Tables/UsersTable.php`
   - Add more columns

3. **Update User Form** (15 min)
   - Edit `app/Filament/Resources/Users/Schemas/UserForm.php`
   - Add more fields

4. **Create Student Resource** (20 min)
   ```bash
   php artisan make:filament-resource Course --panel=student
   ```

5. **Add Widget** (15 min)
   ```bash
   php artisan make:filament-widget StudentStats --stats-overview --panel=student
   ```

---

## 📞 If Something Breaks

```bash
# Step 1: Clear everything
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Step 2: Restart
php artisan serve

# Step 3: Check logs
tail -f storage/logs/laravel.log

# Step 4: Debug specific resource
php artisan tinker
>>> App\Filament\Resources\UserResource::class
```

---

## 🎉 You're Ready!

Start with:
```bash
php artisan serve
npm run dev
```

Then visit: http://localhost:8000/admin

Happy coding! 🚀
