<?php

/**
 * Quick Delete All Users Script
 * 
 * Deletes all mock users and related data in seconds
 * Run via: php scripts/delete_all_users.php
 */

$dbHost = 'junction.proxy.rlwy.net';
$dbPort = 23310;
$dbName = 'railway';
$dbUser = 'root';
$dbPassword = 'ZDmFDkWEAequzjfKCiVhleFzLnwyZpGk';

try {
    $pdo = new PDO(
        "mysql:host={$dbHost};port={$dbPort};dbname={$dbName}",
        $dbUser,
        $dbPassword,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "✓ Connected to database\n\n";
    
    // Get user count before
    $countBefore = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    echo "Users to delete: {$countBefore}\n\n";
    
    if ($countBefore == 0) {
        echo "✓ Database already empty\n";
        exit(0);
    }
    
    echo "⚠️  DELETING ALL USERS AND RELATED DATA...\n\n";
    
    // Disable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS=0");
    
    // Get all tables with foreign keys to users
    $tables = [
        'exam_sessions',
        'exam_answers',
        'enrollments',
        'transactions',
        'ai_gradings',
        'notes',
        'grade_items',
        'exam_attempts',
        'question_favorites',
        'notifications',
        'api_tokens',
        'sessions',
        'password_reset_tokens',
        'personal_access_tokens',
    ];
    
    $totalDeleted = 0;
    
    // Delete from dependent tables
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '{$table}'");
        if ($stmt->rowCount() > 0) {
            $deleted = $pdo->exec("DELETE FROM {$table}");
            
            if ($deleted > 0) {
                echo "  {$table}: {$deleted} records\n";
                $totalDeleted += $deleted;
            }
        }
    }
    
    // Delete all users
    $deletedUsers = $pdo->exec("DELETE FROM users");
    echo "  users: {$deletedUsers} records\n";
    $totalDeleted += $deletedUsers;
    
    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS=1");
    
    // Verify
    $countAfter = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    
    echo "\n✓ Deletion complete!\n";
    echo "  Records deleted: {$totalDeleted}\n";
    echo "  Users remaining: {$countAfter}\n";
    
    exit(0);
    
} catch (PDOException $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
    exit(1);
}
