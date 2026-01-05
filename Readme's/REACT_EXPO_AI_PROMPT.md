# React Expo School Management System - AI Development Prompt

## Project Overview
Create a React Expo mobile application for **Skeeme**, a comprehensive school course management system. The app should mirror the Laravel web platform's functionality while providing optimized mobile UX for students, lecturers, and administrators.

---

## Core Architecture & Setup

### Technology Stack
- **Framework**: React Expo (React Native)
- **Navigation**: React Navigation (Stack, Bottom Tab, Drawer navigation)
- **State Management**: Redux Toolkit or Context API + useReducer
- **Async Storage**: Expo SecureStore for tokens, AsyncStorage for app data
- **HTTP Client**: Axios with interceptors for API calls
- **UI Components**: Expo's built-in components + Custom components
- **Styling**: NativeWind (Tailwind CSS for React Native) or React Native StyleSheet
- **Form Handling**: React Hook Form with Zod validation
- **Testing**: Jest + React Native Testing Library
- **Build Target**: iOS & Android

### Project Structure
```
skeeme-expo/
├── src/
│   ├── api/
│   │   ├── client.ts                    // Axios instance with interceptors
│   │   ├── endpoints/
│   │   │   ├── auth.ts
│   │   │   ├── courses.ts
│   │   │   ├── attendance.ts
│   │   │   ├── exams.ts
│   │   │   ├── grades.ts
│   │   │   ├── students.ts
│   │   │   ├── lecturers.ts
│   │   │   └── announcements.ts
│   │   └── hooks/
│   │       ├── useApi.ts                // Generic hook for API calls
│   │       ├── useAuth.ts
│   │       ├── useCourses.ts
│   │       └── ... (other resource hooks)
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── VerificationScreen.tsx
│   │   ├── Student/
│   │   │   ├── StudentDashboardScreen.tsx
│   │   │   ├── CoursesScreen.tsx
│   │   │   ├── CourseDetailScreen.tsx
│   │   │   ├── AttendanceScreen.tsx
│   │   │   ├── GradesScreen.tsx
│   │   │   ├── ExamsScreen.tsx
│   │   │   ├── ExamDetailScreen.tsx
│   │   │   ├── NotesScreen.tsx
│   │   │   ├── CurriculumScreen.tsx
│   │   │   ├── MessagesScreen.tsx
│   │   │   └── AnnouncementsScreen.tsx
│   │   ├── Lecturer/
│   │   │   ├── LecturerDashboardScreen.tsx
│   │   │   ├── MyCoursesScreen.tsx
│   │   │   ├── CourseManagementScreen.tsx
│   │   │   ├── CreateCourseScreen.tsx
│   │   │   ├── AttendanceScreen.tsx
│   │   │   ├── ExamManagementScreen.tsx
│   │   │   ├── GradeManagementScreen.tsx
│   │   │   ├── NotesScreen.tsx
│   │   │   ├── CurriculumScreen.tsx
│   │   │   ├── MessagesScreen.tsx
│   │   │   └── ReportsScreen.tsx
│   │   ├── Admin/
│   │   │   ├── AdminDashboardScreen.tsx
│   │   │   ├── StudentsManagementScreen.tsx
│   │   │   ├── LecturersManagementScreen.tsx
│   │   │   ├── ClassesManagementScreen.tsx
│   │   │   ├── CoursesManagementScreen.tsx
│   │   │   ├── AnnouncementsScreen.tsx
│   │   │   ├── SubscriptionScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── Common/
│   │       ├── SplashScreen.tsx
│   │       ├── SettingsScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       └── NotificationsScreen.tsx
│   ├── components/
│   │   ├── Common/
│   │   │   ├── Header.tsx
│   │   │   ├── CustomButton.tsx
│   │   │   ├── CustomCard.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ToastNotification.tsx
│   │   ├── Forms/
│   │   │   ├── TextInput.tsx
│   │   │   ├── SelectDropdown.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── CheckBox.tsx
│   │   │   └── FormField.tsx
│   │   ├── Cards/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── StudentCard.tsx
│   │   │   ├── LecturerCard.tsx
│   │   │   ├── AnnouncementCard.tsx
│   │   │   ├── GradeCard.tsx
│   │   │   ├── AttendanceCard.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── Lists/
│   │   │   ├── CoursesListView.tsx
│   │   │   ├── StudentsListView.tsx
│   │   │   ├── AnnouncementsListView.tsx
│   │   │   └── PaginatedList.tsx
│   │   └── Navigation/
│   │       ├── TabBar.tsx
│   │       ├── DrawerContent.tsx
│   │       └── HeaderRight.tsx
│   ├── store/
│   │   ├── store.ts                     // Redux store configuration
│   │   ├── slices/
│   │   │   ├── authSlice.ts             // Auth state (user, tokens, role)
│   │   │   ├── appSlice.ts              // App state (theme, language, etc)
│   │   │   ├── coursesSlice.ts
│   │   │   ├── attendanceSlice.ts
│   │   │   ├── gradesSlice.ts
│   │   │   └── notificationsSlice.ts
│   │   └── middleware/
│   │       └── apiMiddleware.ts
│   ├── hooks/
│   │   ├── useTheme.ts
│   │   ├── useNotification.ts
│   │   ├── useAuth.ts
│   │   └── usePagination.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── colors.ts                    // Design system colors
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── helpers.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── errorHandler.ts
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── StudentNavigator.tsx
│   │   ├── LecturerNavigator.tsx
│   │   └── AdminNavigator.tsx
│   ├── contexts/
│   │   ├── ThemeContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── AuthContext.tsx
│   ├── types/
│   │   ├── index.ts                     // Central type definitions
│   │   ├── models.ts                    // Database models (Course, User, etc)
│   │   ├── api.ts                       // API request/response types
│   │   └── navigation.ts
│   ├── theme/
│   │   ├── lightTheme.ts                // Light mode colors & styles
│   │   ├── darkTheme.ts                 // Dark mode colors & styles
│   │   └── index.ts                     // Theme provider
│   ├── services/
│   │   ├── storage.ts                   // Secure storage service
│   │   ├── notifications.ts             // Push notifications
│   │   └── analytics.ts
│   ├── App.tsx                          // Root component
│   └── index.ts
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── __tests__/
├── app.json
├── eas.json
└── package.json
```

---

## REST API Integration

### API Base Configuration
```typescript
// Endpoint: configured via environment variables
API_BASE_URL: https://your-skeeme-backend.com/api/v1
Authentication: Bearer Token (stored in SecureStore)
```

### Core API Endpoints to Implement

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh-token` - Refresh JWT token
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/verify-email` - Email verification

#### User Profile
- `GET /user/profile` - Get current user profile
- `PUT /user/profile` - Update profile
- `POST /user/change-password` - Change password
- `GET /user/notifications` - Get notifications
- `PATCH /user/notifications/:id/read` - Mark notification as read

#### Student Endpoints
- `GET /student/dashboard` - Dashboard data (stats, courses, announcements)
- `GET /student/courses` - List enrolled courses
- `GET /student/courses/:id` - Course details with materials
- `GET /student/courses/:id/materials` - Course materials/notes
- `GET /student/courses/:id/lessons` - Course curriculum
- `GET /student/grades` - Student grades
- `GET /student/grades/:courseId` - Grades for specific course
- `GET /student/attendance` - Attendance records
- `GET /student/exams` - List exams
- `GET /student/exams/:id` - Exam details
- `POST /student/exams/:id/submit` - Submit exam answers
- `GET /student/messages` - Inbox messages
- `POST /student/messages` - Send message

#### Lecturer Endpoints
- `GET /lecturer/dashboard` - Dashboard (stats, courses, recent activities)
- `GET /lecturer/courses` - Assigned courses
- `POST /lecturer/courses` - Create new course
- `PUT /lecturer/courses/:id` - Update course
- `GET /lecturer/courses/:id` - Course details
- `DELETE /lecturer/courses/:id` - Delete course
- `POST /lecturer/courses/:id/materials` - Upload course material
- `GET /lecturer/courses/:id/students` - List course students
- `GET /lecturer/courses/:id/attendance` - Take attendance
- `POST /lecturer/courses/:id/attendance` - Record attendance
- `GET /lecturer/courses/:id/exams` - Course exams
- `POST /lecturer/courses/:id/exams` - Create exam
- `POST /lecturer/courses/:id/grades` - Bulk upload grades
- `PUT /lecturer/courses/:id/grades/:studentId` - Update student grade
- `GET /lecturer/attendance/history` - Attendance history
- `GET /lecturer/attendance/reports` - Generate attendance reports
- `GET /lecturer/messages` - Messages
- `POST /lecturer/messages` - Send message

#### Admin Endpoints
- `GET /admin/dashboard` - Dashboard (stats, pending approvals)
- `GET /admin/students` - List all students (with pagination, filtering)
- `POST /admin/students` - Create student
- `PUT /admin/students/:id` - Update student
- `DELETE /admin/students/:id` - Deactivate student
- `GET /admin/lecturers` - List lecturers (with pagination, filtering)
- `POST /admin/lecturers` - Create lecturer
- `PUT /admin/lecturers/:id` - Update lecturer
- `PATCH /admin/lecturers/:id/approve` - Approve pending lecturer
- `DELETE /admin/lecturers/:id` - Deactivate lecturer
- `GET /admin/classes` - List classes
- `POST /admin/classes` - Create class
- `PUT /admin/classes/:id` - Update class
- `DELETE /admin/classes/:id` - Delete class
- `GET /admin/courses` - List all courses
- `POST /admin/courses/:courseId/assign-lecturer` - Assign lecturer to course
- `GET /admin/announcements` - List announcements
- `POST /admin/announcements` - Create announcement
- `PUT /admin/announcements/:id` - Update announcement
- `DELETE /admin/announcements/:id` - Delete announcement
- `GET /admin/subscription` - Subscription info
- `POST /admin/subscription/renew` - Renew subscription

### API Integration Features

#### 1. Axios Configuration & Interceptors
```typescript
// Intercept all requests to add auth token
// Intercept responses to handle 401 (token refresh) and other errors
// Implement retry logic for failed requests
// Add request/response logging in development
```

#### 2. Error Handling
- Centralized error handling with custom error codes
- Network error detection
- Invalid token handling with automatic refresh
- User-friendly error messages via Toast notifications

#### 3. Data Caching
- Cache API responses in Redux store
- Implement stale-while-revalidate pattern
- Manual refresh capability
- Cache invalidation on mutations

#### 4. Pagination & Infinite Scroll
- Implement pagination for list endpoints
- Support infinite scroll for lists
- Handle pagination metadata from backend

---

## Design System & Theme

### Color Palette (Light Mode)
```
Primary Colors:
- Primary: #3B82F6 (Blue)
- PrimaryDark: #1D4ED8
- PrimaryLight: #DBEAFE

Secondary Colors:
- Secondary: #10B981 (Green - for success/approve)
- SecondaryDark: #047857
- SecondaryLight: #D1FAE5

Accent Colors:
- Accent: #F59E0B (Amber - for warnings/attention)
- AccentDark: #D97706
- AccentLight: #FEF3C7

Status Colors:
- Success: #10B981
- Error: #EF4444
- Warning: #F59E0B
- Info: #3B82F6

Neutral Colors:
- White: #FFFFFF
- Gray50: #F9FAFB
- Gray100: #F3F4F6
- Gray200: #E5E7EB
- Gray300: #D1D5DB
- Gray400: #9CA3AF
- Gray500: #6B7280
- Gray600: #4B5563
- Gray700: #374151
- Gray800: #1F2937
- Gray900: #111827
- Black: #000000
```

### Color Palette (Dark Mode)
```
Primary Colors (adjusted for dark backgrounds):
- Primary: #60A5FA (Lighter Blue)
- PrimaryDark: #3B82F6
- PrimaryLight: #93C5FD

Secondary: #34D399 (Lighter Green)
Accent: #FBBF24 (Lighter Amber)
Status Colors: (Same as light mode but optimized for contrast)

Neutral (inverted):
- Background: #111827 (Dark Gray)
- Surface: #1F2937 (Slightly lighter gray for cards)
- Text Primary: #F9FAFB (Off-white)
- Text Secondary: #D1D5DB (Light gray)
- Border: #374151 (Dark border)
```

### Typography
```
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif

Font Sizes:
- H1: 32px, Bold (600), Line Height: 1.25
- H2: 28px, Bold (600), Line Height: 1.3
- H3: 24px, Semi-Bold (500), Line Height: 1.35
- H4: 20px, Semi-Bold (500), Line Height: 1.4
- Body: 16px, Regular (400), Line Height: 1.5
- Small: 14px, Regular (400), Line Height: 1.43
- XSmall: 12px, Regular (400), Line Height: 1.33
- Caption: 10px, Regular (400), Line Height: 1.2

Font Weights:
- Regular: 400
- Medium: 500
- Semi-Bold: 600
- Bold: 700
```

### Spacing
```
2px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 56px, 64px

Standard Padding:
- Container: 16px horizontal
- Card: 16px
- Button: 12px vertical, 16px horizontal

Standard Gaps:
- Section Gap: 24px
- Component Gap: 16px
- List Item Gap: 12px
```

### Component Styling Examples

#### Button
- **Primary**: Blue background, white text, 44px height (touch target)
- **Secondary**: Blue outline, blue text, 44px height
- **Danger**: Red background, white text
- **Loading State**: Gray background with spinner

#### Card
- **Light Mode**: White background, gray border, subtle shadow
- **Dark Mode**: Dark gray surface, subtle border, no shadow
- Padding: 16px, Border Radius: 12px

#### Input
- **Light Mode**: Light gray background, dark gray border on focus, dark text
- **Dark Mode**: Dark surface background, light border on focus, light text
- Height: 44px, Border Radius: 8px, Padding: 12px

#### Tab/Navigation
- **Active**: Blue underline or background
- **Inactive**: Gray text
- Touch target: 56px minimum height

### Theme Implementation
```typescript
// Implement theme context that provides:
// - Colors based on light/dark mode preference
// - Typography styles
// - Spacing constants
// - Component variant styles
// 
// Provider should:
// - Listen to device's dark mode preference
// - Allow manual toggle
// - Persist preference to AsyncStorage
// - Update all components reactively
```

---

## Feature Implementation Requirements

### 1. Authentication & Authorization
- **Login**: Email/username + password authentication
- **Token Storage**: Use SecureStore for JWT tokens
- **Token Refresh**: Implement automatic token refresh on 401
- **Logout**: Clear tokens and navigate to login
- **Role-Based Access**: Show different screens based on user role (student, lecturer, admin)
- **Deep Linking**: Support deep links to specific screens post-login

### 2. Dashboard Screens (Role-Specific)
#### Student Dashboard
- **Stats**: Courses enrolled, average grade, attendance rate, pending assignments
- **Recent Courses**: Show 4-5 recently accessed courses (expandable)
- **Announcements**: Latest school announcements (scrollable)
- **Quick Actions**: Links to key features (exams, grades, attendance)

#### Lecturer Dashboard
- **Stats**: Students taught, courses created, pending grades, average attendance
- **My Courses**: Quick access to courses with pending tasks (badge notifications)
- **Recent Activities**: Student submissions, exam completions
- **Announcements**: View and create announcements

#### Admin Dashboard
- **Stats**: Total students, lecturers, classes, active courses, subscription status
- **Pending Approvals**: Pending lecturer registrations with approve/reject actions
- **Recent Activities**: New enrollments, course creations, system activities
- **Subscription Info**: Days left, student limit, renewal button

### 3. Course Management
- **Browse Courses**: List of enrolled/assigned courses with search/filter
- **Course Details**: Course info, lecturer(s), materials, schedule, students count
- **Course Materials**: View uploaded notes/files
- **Curriculum/Topics**: Display scheme of work/topics covered
- **Create Course** (Lecturer): Form to create new course within school
- **Manage Course** (Lecturer): Edit course, upload materials, manage students
- **Assign Courses** (Admin): Assign lecturers to courses, assign to classes

### 4. Attendance Management
- **Take Attendance** (Lecturer): Mark students present/absent with timestamp
- **View Attendance** (Lecturer): History of attendance records
- **Attendance Reports**: Generate reports by date, course, or student
- **Student Attendance**: View personal attendance records with percentages
- **Attendance Analytics**: Charts/graphs showing attendance trends

### 5. Exam Management
- **View Exams** (Student): List of exams with dates, status
- **Take Exam** (Student): 
  - Display questions one-by-one or all at once
  - Support multiple choice, short answer, essay
  - Timer functionality (if applicable)
  - Submission confirmation
- **Create Exam** (Lecturer): 
  - Form to create exam with questions
  - Set duration and date
  - Add to courses
- **Grade Exam** (Lecturer): View submissions, enter grades, provide feedback
- **Exam Management** (Admin): View all exams, manage exam schedules

### 6. Grades Management
- **View Grades** (Student): 
  - GPA calculation
  - Course-wise grades
  - Grade breakdown (assignments, exams, etc.)
  - Grade trends (if applicable)
- **Manage Grades** (Lecturer): 
  - Bulk upload grades
  - Edit individual grades
  - Add notes/feedback per student
- **Grade Reports** (Admin): View grade statistics

### 7. Messages/Communication
- **Inbox**: List of messages with search/filter
- **Compose Message**: Send message to individual or group
- **Message Thread**: View conversation thread
- **Notifications**: Real-time message notifications (if using push notifications)
- **Read Receipts**: Show if message is read

### 8. Announcements
- **View Announcements** (All): List of school announcements
- **Create Announcement** (Lecturer/Admin): 
  - Title, content, attachments
  - Publish immediately or schedule
  - Target audience selection
- **Announcement Details**: Full announcement view with timestamps

### 9. User Management (Admin Only)
- **Students List**: 
  - Paginated list with search/filter
  - Action buttons: view profile, edit, deactivate
  - Bulk actions (if needed)
- **Lecturers List**: 
  - Paginated list
  - Approve pending lecturers
  - View profile, edit, deactivate
- **Classes Management**: Create, edit, delete classes
- **Student Profiles**: View enrollment, courses, grades, attendance

### 10. Settings & Profile
- **Profile Screen**: View/edit personal information
- **Change Password**: Secure password change
- **Theme Toggle**: Switch between light and dark mode
- **Language Preference**: (Optional) Support multiple languages
- **Notifications Settings**: (If using push notifications) Toggle notification types
- **Logout**: Confirm logout and clear secure storage

### 11. Notifications & Toasts
- **Toast Notifications**: 
  - Success (green) for completed actions
  - Error (red) for failures
  - Info (blue) for general updates
  - Warning (amber) for cautions
  - Auto-dismiss after 3-4 seconds
  - Dismiss button available
- **System Notifications**: 
  - (Optional) Push notifications for exams, announcements, messages
  - Badge counts on app icon/tabs

### 12. Offline Capabilities (Optional but Recommended)
- **Cached Data**: Show cached data when offline
- **Sync Queue**: Queue actions to sync when connection restored
- **Offline Indicator**: Show connectivity status

---

## Technical Implementation Details

### State Management Strategy
```typescript
// Use Redux Toolkit with these slices:
// 1. authSlice - user, tokens, role, isAuthenticated
// 2. appSlice - theme, connectivity, loading states
// 3. coursesSlice - cached courses, selected course
// 4. attendanceSlice - attendance records
// 5. gradesSlice - grade data
// 6. notificationsSlice - toast notifications, badge counts
// 7. uiSlice - modals, bottomSheets, drawer visibility

// Implement thunk actions for async API calls
// Use selectors for derived state (e.g., user role)
```

### Navigation Structure
```
RootNavigator
├── SplashScreen (initial)
├── AuthNavigator (if not authenticated)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
└── MainNavigator (if authenticated)
    ├── DrawerNavigator (Sidebar)
    │   ├── StudentNavigator (Bottom Tab Nav)
    │   │   ├── DashboardStack
    │   │   ├── CoursesStack
    │   │   ├── GradesStack
    │   │   ├── ExamsStack
    │   │   ├── AttendanceStack
    │   │   ├── NotesStack
    │   │   ├── MessagesStack
    │   │   └── AnnouncementsStack
    │   ├── LecturerNavigator (similar structure)
    │   └── AdminNavigator (similar structure)
    ├── SettingsStack (from drawer)
    ├── ProfileStack (from drawer)
    └── NotificationsStack
```

### Form Validation
```typescript
// Use React Hook Form + Zod for validation
// Validate in real-time as user types
// Show field-level error messages
// Disable submit button until form is valid
```

### Image/File Handling
```typescript
// Use expo-image-picker for selecting images/files
// Use expo-media-library for accessing device gallery
// Compress images before upload to reduce bandwidth
// Show upload progress with percentage
```

### Performance Optimization
- **Lazy Loading**: Implement lazy loading for lists with FlatList
- **Memoization**: Use React.memo for frequently re-rendering components
- **Image Optimization**: Use optimized image sizes, lazy load images
- **Bundle Size**: Monitor and optimize bundle size
- **App Startup**: Optimize splash screen and initialization

### Error Handling & Logging
```typescript
// Implement comprehensive error handling:
// - Network errors with retry mechanism
// - Validation errors with field highlighting
// - Server errors with user-friendly messages
// - Unexpected errors with error boundary
// 
// Log errors to service (e.g., Sentry) for debugging
```

---

## Development Workflow

### Setup Instructions
1. Initialize Expo project: `npx create-expo-app skeeme-expo`
2. Install dependencies from package.json template
3. Configure environment variables (.env, .env.local)
4. Set up API endpoint configuration
5. Create Redux store setup
6. Implement theme provider
7. Set up navigation structure
8. Create authentication flow

### Environment Variables (.env)
```
EXPO_PUBLIC_API_BASE_URL=https://your-backend.com/api/v1
EXPO_PUBLIC_APP_NAME=Skeeme
EXPO_PUBLIC_VERSION=1.0.0
```

### Development Practices
- Use TypeScript throughout for type safety
- Follow atomic component design
- Write reusable custom hooks
- Implement error boundaries
- Test components with React Native Testing Library
- Use EAS for building and deployment
- Follow React Native best practices (FlatList vs ScrollView, etc.)

### Code Organization Principles
- Single Responsibility: Each component/hook has one purpose
- DRY: Extract reusable components and hooks
- Separation of Concerns: Keep UI, logic, and data separate
- Consistency: Follow naming conventions and patterns throughout

---

## Testing Strategy

### Unit Tests
- Test utility functions and helpers
- Test Redux reducers and selectors
- Test custom hooks

### Component Tests
- Test component rendering with different props
- Test user interactions (button clicks, form submissions)
- Test conditional rendering
- Test error states

### Integration Tests
- Test API integration with mock server
- Test navigation flows
- Test authentication flow

### E2E Tests
- Test complete user journeys (login → course access → exam submission)

---

## Deployment & Distribution

### Build Process
```
# Using EAS Build
eas build --platform ios
eas build --platform android

# Preview/Testing
eas build --platform android --profile preview
```

### Submission Requirements
- Prepare app store listings (description, screenshots, keywords)
- Configure app signing and certificates
- Privacy policy and terms of service
- Target API level: Latest stable Android/iOS

### Post-Launch
- Monitor crash reports and analytics
- Fix critical bugs immediately
- Gather user feedback
- Plan feature updates

---

## Additional Considerations

### Accessibility
- Use proper contrast ratios for text
- Implement accessible labels for touch targets
- Support screen readers where possible
- Minimum touch target size: 44x44 points

### Security
- Never store sensitive data in plain text
- Use SecureStore for tokens and passwords
- Validate all user input on client and server
- Implement certificate pinning for API calls
- Use HTTPS for all API communications
- Implement rate limiting on client side

### Internationalization (Optional)
- Set up i18n library (i18next, react-i18next)
- Create translation files for supported languages
- Allow language preference toggle in settings

### Analytics & Monitoring
- Integrate analytics service (Firebase Analytics, Mixpanel, etc.)
- Track key user actions (login, course access, exam submission)
- Monitor app performance and crash rates
- Set up alerts for critical errors

---

## Success Criteria

✅ User can login with email/password and token is securely stored  
✅ Role-based navigation shows correct screens  
✅ API calls succeed with proper authentication headers  
✅ Courses display with materials and curriculum  
✅ Attendance marking works with timestamp  
✅ Exams display and submissions work  
✅ Grades display correctly  
✅ Messages/communication works  
✅ Theme toggle switches between light/dark mode  
✅ Offline data caching displays recent data  
✅ Error handling shows user-friendly messages  
✅ App is responsive on various screen sizes  
✅ Performance is smooth with no lag  

---

## Notes for AI Implementation

- **Priority Order**: Auth → Dashboard → Core Features (Courses, Grades, Attendance) → Advanced Features
- **Start with Student Role**: Implement full student experience first, then expand to lecturer and admin
- **Use Mock Data Initially**: Use mock API responses during development, integrate real API after core structure
- **Component Library**: Build a comprehensive set of reusable components first
- **Iterate on Design**: Be ready to adjust UI/UX based on mobile platform constraints
- **Performance First**: Profile app performance early and optimize bottlenecks
- **Testing Throughout**: Write tests as you build, not after
- **Documentation**: Keep code well-documented with JSDoc comments

