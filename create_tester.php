<?php

$host = '66.33.22.241';
$port = 23310;
$user = 'root';
$pass = 'ZDmFDkWEAequzjfKCiVhleFzLnwyZpGk';
$db   = 'railway';

$conn = new mysqli($host, $user, $pass, $db, $port);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$email = 'tester@skeeme.com';
$name = 'Google Reviewer';
$password = password_hash('password', PASSWORD_BCRYPT);
$credits = 100000;
$role = 'student';
$status = 'active';

// Check if user exists
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    // Update existing - Force Elite (Max) status
    $stmt = $conn->prepare("UPDATE users SET name = ?, password = ?, is_unlimited_student = 1, credits = 999999, status = 'active', role = 'student' WHERE email = ?");
    $stmt->bind_param("sss", $name, $password, $email);
    echo "Updating existing tester account to Elite (Max) tier...\n";
} else {
    // Insert new - Set as Elite (Max)
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, status, is_unlimited_student, credits, referral_code, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, 999999, ?, NOW(), NOW())");
    $ref = 'GOOGLE_TEST';
    $stmt->bind_param("ssssss", $name, $email, $password, $role, $status, $ref);
    echo "Creating new Elite (Max) tester account...\n";
}

if ($stmt->execute()) {
    echo "SUCCESS: Tester account 'tester@skeeme.com' is now ready with Elite (Max) access!\n";
} else {
    echo "ERROR: " . $stmt->error . "\n";
}

$conn->close();
