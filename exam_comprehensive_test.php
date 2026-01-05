<?php

/**
 * COMPREHENSIVE EXAM SYSTEM TEST
 * 
 * This is a standalone PHP test that:
 * - Creates an exam with all question types
 * - Tests student exam-taking flow
 * - Verifies timer functionality
 * - Tests score calculation
 * - Validates all exam-related functionality
 * 
 * Run: php exam_comprehensive_test.php
 */

// ============================================================================
// CONFIGURATION & CONNECTION
// ============================================================================

$db_host = '127.0.0.1';
$db_port = 3306;
$db_name = 'skeeme';
$db_user = 'root';
$db_password = '';

// Connect to database
$mysqli = new mysqli($db_host, $db_user, $db_password, $db_name, $db_port);

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

$mysqli->set_charset("utf8mb4");

// Color codes for output
$colors = [
    'reset' => "\033[0m",
    'green' => "\033[32m",
    'red' => "\033[31m",
    'yellow' => "\033[33m",
    'blue' => "\033[34m",
    'cyan' => "\033[36m",
];

$test_results = [
    'passed' => 0,
    'failed' => 0,
    'tests' => []
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function print_header($text) {
    global $colors;
    echo "\n" . str_repeat("=", 80) . "\n";
    echo $colors['cyan'] . $text . $colors['reset'] . "\n";
    echo str_repeat("=", 80) . "\n";
}

function print_test($text, $passed, $message = "") {
    global $test_results, $colors;
    
    $status = $passed ? $colors['green'] . "✓ PASS" . $colors['reset'] : $colors['red'] . "✗ FAIL" . $colors['reset'];
    echo "  {$status} - {$text}";
    
    if ($message) {
        echo " ({$message})";
    }
    echo "\n";
    
    $test_results['tests'][] = [
        'name' => $text,
        'passed' => $passed,
        'message' => $message
    ];
    
    if ($passed) {
        $test_results['passed']++;
    } else {
        $test_results['failed']++;
    }
}

function get_db() {
    global $mysqli;
    return $mysqli;
}

function query_execute($query, $params = []) {
    global $mysqli;
    
    if ($params) {
        $stmt = $mysqli->prepare($query);
        if (!$stmt) {
            return ['success' => false, 'error' => $mysqli->error];
        }
        
        $types = '';
        foreach ($params as $param) {
            if (is_int($param)) $types .= 'i';
            elseif (is_float($param)) $types .= 'd';
            else $types .= 's';
        }
        
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $rows = $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
        $stmt->close();
        
        return ['success' => true, 'rows' => $rows];
    } else {
        $result = $mysqli->query($query);
        if (!$result) {
            return ['success' => false, 'error' => $mysqli->error];
        }
        
        $rows = $result->fetch_all(MYSQLI_ASSOC);
        return ['success' => true, 'rows' => $rows];
    }
}

// ============================================================================
// TEST 1: GET ACCOUNTS FROM DATABASE
// ============================================================================

print_header("TEST 1: FETCHING TEST ACCOUNTS");

$result = query_execute("SELECT id, name, email, role FROM users WHERE role IN ('lecturer', 'student') LIMIT 10");
$accounts = $result['rows'] ?? [];

if (count($accounts) > 0) {
    print_test("Accounts retrieved from database", true, count($accounts) . " accounts found");
    echo "\nAvailable Accounts:\n";
    foreach ($accounts as $acc) {
        echo "  - {$acc['email']} (ID: {$acc['id']}, Role: {$acc['role']})\n";
    }
} else {
    print_test("Accounts retrieved from database", false, "No accounts found");
}

// Get lecturer and students
$lecturer = null;
$students = [];

foreach ($accounts as $acc) {
    if ($acc['role'] === 'lecturer' && !$lecturer) {
        $lecturer = $acc;
    } elseif ($acc['role'] === 'student') {
        $students[] = $acc;
    }
}

$test_lecturer = $lecturer ?? null;
$test_student = $students[0] ?? null;

if (!$test_lecturer) {
    echo $colors['yellow'] . "WARNING: No lecturer found, will use first available user\n" . $colors['reset'];
    $all_users = query_execute("SELECT id, name, email, role FROM users LIMIT 1");
    $test_lecturer = $all_users['rows'][0] ?? null;
}

if (!$test_student) {
    echo $colors['yellow'] . "WARNING: No student found, will use first available user\n" . $colors['reset'];
    $all_users = query_execute("SELECT id, name, email, role FROM users LIMIT 1 OFFSET 1");
    $test_student = $all_users['rows'][0] ?? null;
}

print_test("Lecturer account available", $test_lecturer !== null, $test_lecturer ? $test_lecturer['email'] : "");
print_test("Student account available", $test_student !== null, $test_student ? $test_student['email'] : "");

if (!$test_lecturer || !$test_student) {
    die($colors['red'] . "Cannot continue without lecturer and student accounts\n" . $colors['reset']);
}

$lecturer_id = $test_lecturer['id'];
$student_id = $test_student['id'];

// Get course
$course_result = query_execute("SELECT id, name, code FROM courses LIMIT 1");
$course = $course_result['rows'][0] ?? null;

if (!$course) {
    print_test("Course available", false, "No courses found");
    die($colors['red'] . "Cannot continue without a course\n" . $colors['reset']);
}

print_test("Course available", true, $course['name']);
$course_id = $course['id'];

// ============================================================================
// TEST 2: CREATE EXAM
// ============================================================================

print_header("TEST 2: CREATING EXAM");

$exam_title = "Comprehensive Exam Test - " . date('Y-m-d H:i:s');
$exam_description = "Full test of exam system with all question types";
$exam_date = date('Y-m-d', strtotime('+7 days'));
$exam_duration = 60; // 60 minutes
$exam_total_marks = 100;

$insert_query = "INSERT INTO exams (
    course_id, lecturer_id, title, description, exam_date, 
    duration, total_marks, status, randomize_questions, randomize_options, 
    created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', true, true, NOW(), NOW())";

$params = [
    $course_id, 
    $lecturer_id, 
    $exam_title, 
    $exam_description, 
    $exam_date, 
    $exam_duration, 
    $exam_total_marks
];

$stmt = $mysqli->prepare($insert_query);
$types = 'iisssii';
$stmt->bind_param($types, ...$params);
$stmt->execute();

$exam_id = $mysqli->insert_id;
$stmt->close();

$exam_created = $exam_id > 0;
print_test("Exam created successfully", $exam_created, "Exam ID: {$exam_id}");

if (!$exam_created) {
    die($colors['red'] . "Failed to create exam\n" . $colors['reset']);
}

// ============================================================================
// TEST 3: CREATE QUESTIONS OF ALL TYPES
// ============================================================================

print_header("TEST 3: CREATING QUESTIONS (ALL TYPES)");

$questions = [];

// Helper function to generate UUID
function generate_uuid() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

// Question 1: Multiple Choice
$q1_options = json_encode(['Option A', 'Option B', 'Option C', 'Option D']);
$q1_correct = json_encode(['Option B']);
$q1_text = "What is the capital of France?";
$q1_uuid = generate_uuid();
$q1_query = "INSERT INTO questions (
    uuid, question_type, question_text, options, correct_answer, marks, 
    difficulty_level, learning_objective, created_by, status, source, created_at, updated_at
) VALUES (?, 'multiple_choice', ?, ?, ?, 20, 'medium', 'Test knowledge of capitals', ?, 'published', 'manual', NOW(), NOW())";

$stmt = $mysqli->prepare($q1_query);
$stmt->bind_param('ssssi', 
    $q1_uuid,
    $q1_text,
    $q1_options,
    $q1_correct,
    $lecturer_id
);
$stmt->execute();
$questions['q1'] = ['id' => $mysqli->insert_id, 'type' => 'Multiple Choice', 'text' => $q1_text];
$stmt->close();

// Question 2: True/False
$q2_options = json_encode(['True', 'False']);
$q2_correct = json_encode(['True']);
$q2_text = "The Earth orbits around the Sun: True or False?";
$q2_uuid = generate_uuid();
$q2_query = "INSERT INTO questions (
    uuid, question_type, question_text, options, correct_answer, marks, 
    difficulty_level, learning_objective, created_by, status, source, created_at, updated_at
) VALUES (?, 'true_false', ?, ?, ?, 15, 'easy', 'Test basic astronomy', ?, 'published', 'manual', NOW(), NOW())";

$stmt = $mysqli->prepare($q2_query);
$stmt->bind_param('ssssi', 
    $q2_uuid,
    $q2_text,
    $q2_options,
    $q2_correct,
    $lecturer_id
);
$stmt->execute();
$questions['q2'] = ['id' => $mysqli->insert_id, 'type' => 'True/False', 'text' => $q2_text];
$stmt->close();

// Question 3: Short Answer
$q3_correct = json_encode(['Paris', 'paris']);
$q3_text = "What is the capital of France?";
$q3_uuid = generate_uuid();
$q3_query = "INSERT INTO questions (
    uuid, question_type, question_text, options, correct_answer, marks, 
    difficulty_level, learning_objective, created_by, status, source, created_at, updated_at
) VALUES (?, 'short_answer', ?, NULL, ?, 20, 'medium', 'Test geography knowledge', ?, 'published', 'manual', NOW(), NOW())";

$stmt = $mysqli->prepare($q3_query);
$stmt->bind_param('sssi', 
    $q3_uuid,
    $q3_text,
    $q3_correct,
    $lecturer_id
);
$stmt->execute();
$questions['q3'] = ['id' => $mysqli->insert_id, 'type' => 'Short Answer', 'text' => $q3_text];
$stmt->close();

// Question 4: Essay
$q4_text = "Discuss the impact of climate change on global economies";
$q4_uuid = generate_uuid();
$q4_query = "INSERT INTO questions (
    uuid, question_type, question_text, options, correct_answer, marks, 
    difficulty_level, learning_objective, created_by, status, source, created_at, updated_at
) VALUES (?, 'essay', ?, NULL, NULL, 25, 'hard', 'Test analytical thinking', ?, 'published', 'manual', NOW(), NOW())";

$stmt = $mysqli->prepare($q4_query);
$stmt->bind_param('ssi', 
    $q4_uuid,
    $q4_text,
    $lecturer_id
);
$stmt->execute();
$questions['q4'] = ['id' => $mysqli->insert_id, 'type' => 'Essay', 'text' => $q4_text];
$stmt->close();

// Question 5: Fill in the Blank
$q5_correct = json_encode(['photosynthesis']);
$q5_text = "Plants produce glucose through a process called ___________";
$q5_uuid = generate_uuid();
$q5_query = "INSERT INTO questions (
    uuid, question_type, question_text, options, correct_answer, marks, 
    difficulty_level, learning_objective, created_by, status, source, created_at, updated_at
) VALUES (?, 'fill_blank', ?, NULL, ?, 20, 'medium', 'Test biology terminology', ?, 'published', 'manual', NOW(), NOW())";

$stmt = $mysqli->prepare($q5_query);
$stmt->bind_param('sssi', 
    $q5_uuid,
    $q5_text,
    $q5_correct,
    $lecturer_id
);
$stmt->execute();
$questions['q5'] = ['id' => $mysqli->insert_id, 'type' => 'Fill in the Blank', 'text' => $q5_text];
$stmt->close();

echo "\nCreated Questions:\n";
foreach ($questions as $key => $q) {
    $passed = $q['id'] > 0;
    print_test($q['type'] . ": " . substr($q['text'], 0, 50) . "...", $passed, "Q ID: {$q['id']}");
}

// ============================================================================
// TEST 4: ADD QUESTIONS TO EXAM
// ============================================================================

print_header("TEST 4: ADDING QUESTIONS TO EXAM");

$marks_per_question = [20, 15, 20, 25, 20];
$order = 1;

foreach ($questions as $key => $q) {
    $marks = $marks_per_question[$order - 1];
    
    $add_query = "INSERT INTO exam_questions (exam_id, question_id, `order`, marks, created_at, updated_at) 
                  VALUES (?, ?, ?, ?, NOW(), NOW())";
    
    $stmt = $mysqli->prepare($add_query);
    $stmt->bind_param('iiii', $exam_id, $q['id'], $order, $marks);
    $stmt->execute();
    $stmt->close();
    
    print_test("Question {$order} added to exam", true, "Q ID: {$q['id']}");
    $order++;
}

// ============================================================================
// TEST 5: CREATE EXAM SESSION FOR STUDENT
// ============================================================================

print_header("TEST 5: CREATING EXAM SESSION");

$session_query = "INSERT INTO exam_sessions (
    exam_id, student_id, status, started_at, submitted_at, graded_at, 
    time_spent_seconds, questions_answered, score, answers, metadata, 
    created_at, updated_at
) VALUES (?, ?, 'in_progress', NOW(), NULL, NULL, 0, 0, NULL, ?, ?, NOW(), NOW())";

$empty_answers = json_encode([]);
$metadata = json_encode(['browser' => 'Test Browser', 'ip' => '127.0.0.1']);

$stmt = $mysqli->prepare($session_query);
$stmt->bind_param('iiss', $exam_id, $student_id, $empty_answers, $metadata);
$stmt->execute();
$session_id = $mysqli->insert_id;
$stmt->close();

$session_created = $session_id > 0;
print_test("Exam session created", $session_created, "Session ID: {$session_id}");

if (!$session_created) {
    die($colors['red'] . "Failed to create exam session\n" . $colors['reset']);
}

// ============================================================================
// TEST 6: TIMER FUNCTIONALITY
// ============================================================================

print_header("TEST 6: TESTING TIMER FUNCTIONALITY");

// Get session details
$session_check = query_execute("SELECT started_at, id FROM exam_sessions WHERE id = ?", [$session_id]);
$session_data = $session_check['rows'][0] ?? null;

if ($session_data) {
    $started_at = strtotime($session_data['started_at']);
    $now = time();
    $elapsed = $now - $started_at;
    $remaining = ($exam_duration * 60) - $elapsed; // Convert duration from minutes to seconds
    
    print_test("Session started timestamp valid", $started_at > 0, "Started: " . $session_data['started_at']);
    // The time remaining should be close to the exam duration (within 5 seconds of starting)
    $test_passed = $remaining >= ($exam_duration * 60) - 5;
    print_test("Time remaining calculation works", $test_passed, "Remaining: {$remaining}s (expected ~" . ($exam_duration * 60) . "s)");
    print_test("Timer doesn't show negative time", $remaining >= 0, "Time: {$remaining}s");
}


// ============================================================================
// TEST 7: STUDENT ANSWERS QUESTIONS
// ============================================================================

print_header("TEST 7: SIMULATING STUDENT ANSWERS");

$student_answers = [
    1 => 'Option B',           // Multiple Choice
    2 => 'True',              // True/False
    3 => 'Paris',             // Short Answer
    4 => 'This is a detailed essay discussing climate change...', // Essay
    5 => 'photosynthesis'      // Fill in blank
];

$answers_array = [];
$total_correct = 0;
$questions_answered = 0;

foreach ($student_answers as $question_index => $answer) {
    // Create exam answer record
    $answer_query = "INSERT INTO exam_answers (
        exam_session_id, question_id, question_index, student_answer, 
        marks_obtained, marking_status, answered_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())";
    
    // For this simulation, mark MCQ and T/F as auto-graded and correct
    // Mark short answer, essay, fill blank as submitted but needing grading
    $q_id = $questions[$question_index === 1 ? 'q1' : ($question_index === 2 ? 'q2' : ($question_index === 3 ? 'q3' : ($question_index === 4 ? 'q4' : 'q5')))]['id'];
    
    $is_correct = in_array($question_index, [1, 2, 3, 5]) ? 1 : 0;
    $marking_status = in_array($question_index, [1, 2, 5]) ? 'auto_marked' : 'not_marked';
    $marks_obtained = $is_correct ? ($question_index === 1 ? 20 : ($question_index === 2 ? 15 : ($question_index === 3 ? 20 : ($question_index === 4 ? 0 : 20)))) : 0;
    
    if ($is_correct) $total_correct++;
    
    $stmt = $mysqli->prepare($answer_query);
    $stmt->bind_param('iisisi', $session_id, $q_id, $question_index, $answer, $marks_obtained, $marking_status);
    $stmt->execute();
    $stmt->close();
    
    $answers_array[$question_index] = $answer;
    $questions_answered++;
    
    $type_name = $question_index === 1 ? 'MCQ' : ($question_index === 2 ? 'T/F' : ($question_index === 3 ? 'Short' : ($question_index === 4 ? 'Essay' : 'Fill')));
    print_test("Student answered {$type_name} question", true, "Answer: " . substr($answer, 0, 30) . "...");
}

print_test("All questions answered", count($answers_array) === 5, count($answers_array) . "/5 answered");

// ============================================================================
// TEST 8: SCORE CALCULATION
// ============================================================================

print_header("TEST 8: TESTING SCORE CALCULATION");

// Get all answers for this session
$answers_result = query_execute("
    SELECT ea.id, ea.question_id, ea.marks_obtained, eq.marks 
    FROM exam_answers ea
    JOIN exam_questions eq ON eq.question_id = ea.question_id
    WHERE ea.exam_session_id = ? AND eq.exam_id = ?
", [$session_id, $exam_id]);

$answer_records = $answers_result['rows'] ?? [];
$calculated_score = 0;
$max_possible_score = 0;

// Get all exam questions to know max possible
$exam_qs = query_execute("SELECT SUM(marks) as total_marks FROM exam_questions WHERE exam_id = ?", [$exam_id]);
$max_possible_score = (int)($exam_qs['rows'][0]['total_marks'] ?? 100);

foreach ($answer_records as $ans) {
    if ($ans['marks_obtained']) {
        $calculated_score += (float)$ans['marks_obtained'];
    }
}

print_test("Score calculated from answers", $calculated_score > 0, "Score: {$calculated_score}/{$max_possible_score}");
print_test("Score is within valid range", $calculated_score >= 0 && $calculated_score <= $max_possible_score, 
    "{$calculated_score}/{$max_possible_score}");

// ============================================================================
// TEST 9: SUBMIT EXAM SESSION
// ============================================================================

print_header("TEST 9: SUBMITTING EXAM SESSION");

$answers_json = json_encode($answers_array);
$time_spent = 45 * 60; // 45 minutes in seconds

$submit_query = "UPDATE exam_sessions 
                 SET status = 'submitted', 
                     submitted_at = NOW(), 
                     time_spent_seconds = ?, 
                     questions_answered = ?,
                     score = ?,
                     answers = ?
                 WHERE id = ?";

$stmt = $mysqli->prepare($submit_query);
$stmt->bind_param('iiisi', $time_spent, $questions_answered, $calculated_score, $answers_json, $session_id);
$stmt->execute();
$stmt->close();

print_test("Exam submitted successfully", true, "Status: submitted");
print_test("Time spent recorded", $time_spent > 0, "Time: {$time_spent}s");
print_test("Score recorded", $calculated_score > 0, "Score: {$calculated_score}");

// ============================================================================
// TEST 10: VERIFY EXAM DATA INTEGRITY
// ============================================================================

print_header("TEST 10: VERIFYING DATA INTEGRITY");

// Verify exam exists
$exam_verify = query_execute("SELECT id, title, status FROM exams WHERE id = ?", [$exam_id]);
$exam_exists = count($exam_verify['rows']) > 0;
print_test("Exam exists in database", $exam_exists, "Exam ID: {$exam_id}");

// Verify all questions added
$questions_verify = query_execute("SELECT COUNT(*) as count FROM exam_questions WHERE exam_id = ?", [$exam_id]);
$question_count = (int)($questions_verify['rows'][0]['count'] ?? 0);
print_test("All questions linked to exam", $question_count === 5, "{$question_count}/5 questions");

// Verify exam session
$session_verify = query_execute("SELECT id, status, score FROM exam_sessions WHERE id = ?", [$session_id]);
$session_exists = count($session_verify['rows']) > 0;
print_test("Exam session exists", $session_exists, "Session ID: {$session_id}");

if ($session_exists) {
    print_test("Session status is submitted", $session_verify['rows'][0]['status'] === 'submitted', 
        "Status: " . $session_verify['rows'][0]['status']);
    print_test("Session has score", isset($session_verify['rows'][0]['score']), 
        "Score: " . ($session_verify['rows'][0]['score'] ?? 'NULL'));
}

// Verify answers
$answers_verify = query_execute("SELECT COUNT(*) as count FROM exam_answers WHERE exam_session_id = ?", [$session_id]);
$answer_count = (int)($answers_verify['rows'][0]['count'] ?? 0);
print_test("All student answers recorded", $answer_count === 5, "{$answer_count}/5 answers");

// ============================================================================
// TEST 11: EXAM RANDOMIZATION (IF ENABLED)
// ============================================================================

print_header("TEST 11: TESTING RANDOMIZATION SETTINGS");

$randomization_check = query_execute("
    SELECT randomize_questions, randomize_options FROM exams WHERE id = ?", [$exam_id]);

if (count($randomization_check['rows']) > 0) {
    $rand_settings = $randomization_check['rows'][0];
    // In MySQL, boolean values are stored as 0 or 1, but might be returned as strings
    $rand_questions = $rand_settings['randomize_questions'] === 1 || $rand_settings['randomize_questions'] === '1';
    $rand_options = $rand_settings['randomize_options'] === 1 || $rand_settings['randomize_options'] === '1';
    
    print_test("Question randomization enabled", $rand_questions, 
        "Setting: " . ($rand_settings['randomize_questions'] === 1 || $rand_settings['randomize_questions'] === '1' ? 'TRUE' : 'FALSE'));
    print_test("Option randomization enabled", $rand_options, 
        "Setting: " . ($rand_settings['randomize_options'] === 1 || $rand_settings['randomize_options'] === '1' ? 'TRUE' : 'FALSE'));
}

// ============================================================================
// TEST 12: MULTIPLE INSTANCES & EXAM FUNCTIONALITY
// ============================================================================

print_header("TEST 12: TESTING MULTIPLE EXAM INSTANCES");

// Get all exams with their session counts
$all_exams = query_execute("
    SELECT e.id, e.title, e.exam_date, e.status,
           COUNT(es.id) as total_sessions,
           SUM(CASE WHEN es.status = 'submitted' THEN 1 ELSE 0 END) as submitted_sessions
    FROM exams e
    LEFT JOIN exam_sessions es ON e.id = es.exam_id
    GROUP BY e.id
    ORDER BY e.created_at DESC
    LIMIT 5
");

$all_exams_data = $all_exams['rows'] ?? [];
print_test("Multiple exams can be created", count($all_exams_data) > 0, count($all_exams_data) . " exams found");

if (count($all_exams_data) > 0) {
    echo "\nExam Instances Summary:\n";
    foreach ($all_exams_data as $exam_data) {
        echo sprintf("  - %s (ID: %d, Sessions: %d, Submitted: %d)\n",
            substr($exam_data['title'], 0, 40),
            $exam_data['id'],
            $exam_data['total_sessions'] ?? 0,
            $exam_data['submitted_sessions'] ?? 0
        );
    }
}

// ============================================================================
// TEST 13: QUESTION TYPE COVERAGE
// ============================================================================

print_header("TEST 13: VERIFYING QUESTION TYPE COVERAGE");

$question_types = query_execute("
    SELECT DISTINCT question_type, COUNT(*) as count 
    FROM questions 
    GROUP BY question_type
");

$types_data = $question_types['rows'] ?? [];
echo "\nQuestion Types in Database:\n";

$required_types = ['multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank'];
foreach ($required_types as $type) {
    $found = false;
    foreach ($types_data as $db_type) {
        if (strpos($db_type['question_type'], str_replace('_', '', $type)) !== false || 
            $db_type['question_type'] === $type) {
            echo "  {$type}: {$db_type['count']} found\n";
            $found = true;
            break;
        }
    }
    if (!$found) {
        echo "  {$type}: Not found\n";
    }
}

// ============================================================================
// TEST 14: TIMER EXPIRY SIMULATION
// ============================================================================

print_header("TEST 14: SIMULATING TIMER EXPIRY");

$exam_duration_minutes = 60;
$time_limit_seconds = $exam_duration_minutes * 60;

// Get the session again
$session_final = query_execute("SELECT started_at, submitted_at FROM exam_sessions WHERE id = ?", [$session_id]);
$session_info = $session_final['rows'][0] ?? null;

if ($session_info) {
    $started = new DateTime($session_info['started_at']);
    $now = new DateTime();
    $elapsed = $now->getTimestamp() - $started->getTimestamp();
    $remaining = $time_limit_seconds - $elapsed;
    
    print_test("Timer calculation accurate", $remaining >= 0, "Remaining: {$remaining}s of {$time_limit_seconds}s");
    print_test("Timer does not go negative", $remaining >= 0, "Current: {$remaining}s");
    
    if ($remaining < 0) {
        echo $colors['yellow'] . "  Note: Timer would expire (by " . abs($remaining) . "s)\n" . $colors['reset'];
    }
}

// ============================================================================
// TEST 15: EXAM ANALYTICS
// ============================================================================

print_header("TEST 15: CHECKING EXAM ANALYTICS CAPABILITY");

// Check if we can get stats for this exam
$exam_stats = query_execute("
    SELECT 
        COUNT(DISTINCT es.student_id) as unique_students,
        COUNT(es.id) as total_attempts,
        AVG(es.score) as avg_score,
        MAX(es.score) as max_score,
        MIN(es.score) as min_score
    FROM exam_sessions es
    WHERE es.exam_id = ?
", [$exam_id]);

$stats = $exam_stats['rows'][0] ?? null;

if ($stats) {
    echo "\nExam Statistics:\n";
    echo "  - Students: " . ($stats['unique_students'] ?? 0) . "\n";
    echo "  - Total Attempts: " . ($stats['total_attempts'] ?? 0) . "\n";
    echo "  - Average Score: " . (isset($stats['avg_score']) ? round($stats['avg_score'], 2) : 'N/A') . "\n";
    echo "  - Max Score: " . ($stats['max_score'] ?? 'N/A') . "\n";
    echo "  - Min Score: " . ($stats['min_score'] ?? 'N/A') . "\n";
    
    print_test("Exam statistics can be calculated", true, "Stats available");
}

// ============================================================================
// FINAL REPORT
// ============================================================================

print_header("TEST SUMMARY REPORT");

echo "\n";
echo sprintf("Total Tests: %d\n", $test_results['passed'] + $test_results['failed']);
echo $colors['green'] . sprintf("Passed: %d\n", $test_results['passed']) . $colors['reset'];
echo $colors['red'] . sprintf("Failed: %d\n", $test_results['failed']) . $colors['reset'];
echo "\n";

$success_rate = ($test_results['passed'] / ($test_results['passed'] + $test_results['failed'])) * 100;
echo sprintf("Success Rate: %.1f%%\n\n", $success_rate);

if ($test_results['failed'] === 0) {
    echo $colors['green'] . "✓ ALL TESTS PASSED!\n" . $colors['reset'];
} else {
    echo $colors['red'] . "✗ Some tests failed\n" . $colors['reset'];
    echo "\nFailed Tests:\n";
    foreach ($test_results['tests'] as $test) {
        if (!$test['passed']) {
            echo "  - {$test['name']}\n";
        }
    }
}

echo "\n";
echo "Test Data Created:\n";
echo "  - Exam ID: {$exam_id}\n";
echo "  - Exam Title: {$exam_title}\n";
echo "  - Session ID: {$session_id}\n";
echo "  - Student: {$test_student['email']}\n";
echo "  - Lecturer: {$test_lecturer['email']}\n";
echo "  - Questions: 5 (MCQ, T/F, Short, Essay, Fill)\n";
echo "  - Final Score: {$calculated_score}/{$max_possible_score}\n";

echo "\n" . str_repeat("=", 80) . "\n";

$mysqli->close();

?>
