-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 02, 2025 at 01:42 PM
-- Server version: 9.1.0
-- PHP Version: 8.4.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `skeeme`
--

DELIMITER $$
--
-- Procedures
--
DROP PROCEDURE IF EXISTS `MarkMessagesAsRead`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `MarkMessagesAsRead` (IN `p_user_id` INT, IN `p_other_user_id` INT, IN `p_course_id` INT)   BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE msg_id INT;
    DECLARE msg_cursor CURSOR FOR 
        SELECT id FROM messages 
        WHERE (
            (p_course_id IS NOT NULL AND course_id = p_course_id) OR
            (p_course_id IS NULL AND course_id IS NULL AND 
             ((sender_id = p_other_user_id AND recipient_id = p_user_id)))
        );
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN msg_cursor;
    read_loop: LOOP
        FETCH msg_cursor INTO msg_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        INSERT IGNORE INTO message_read_status (message_id, user_id) 
        VALUES (msg_id, p_user_id);
    END LOOP;
    CLOSE msg_cursor;
END$$

--
-- Functions
--
DROP FUNCTION IF EXISTS `GetUnreadMessageCount`$$
CREATE DEFINER=`root`@`localhost` FUNCTION `GetUnreadMessageCount` (`p_user_id` INT) RETURNS INT DETERMINISTIC READS SQL DATA BEGIN
    DECLARE unread_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO unread_count
    FROM messages m
    LEFT JOIN message_read_status mrs ON m.id = mrs.message_id AND mrs.user_id = p_user_id
    WHERE (m.recipient_id = p_user_id OR 
           (m.course_id IN (
               SELECT cc.course_id 
               FROM class_courses cc 
               JOIN users u ON u.class_id = cc.class_id 
               WHERE u.id = p_user_id
           )))
      AND mrs.id IS NULL
      AND m.sender_id != p_user_id;
    
    RETURN unread_count;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `ai_gradings`
--

DROP TABLE IF EXISTS `ai_gradings`;
CREATE TABLE IF NOT EXISTS `ai_gradings` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `exam_answer_id` bigint UNSIGNED NOT NULL,
  `exam_session_id` bigint UNSIGNED NOT NULL,
  `grading_method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marks_awarded` decimal(8,2) NOT NULL DEFAULT '0.00',
  `confidence_score` decimal(5,2) NOT NULL,
  `confidence_threshold` decimal(5,2) NOT NULL DEFAULT '75.00',
  `reasoning` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `analysis_details` json DEFAULT NULL,
  `status` enum('pending_review','approved','rejected','revised') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_review',
  `reviewed_by` bigint UNSIGNED DEFAULT NULL,
  `lecturer_override_reason` text COLLATE utf8mb4_unicode_ci,
  `lecturer_override_marks` decimal(8,2) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ai_gradings_exam_answer_id_unique` (`exam_answer_id`),
  KEY `ai_gradings_reviewed_by_foreign` (`reviewed_by`),
  KEY `ai_gradings_exam_session_id_index` (`exam_session_id`),
  KEY `ai_gradings_status_index` (`status`),
  KEY `ai_gradings_confidence_score_index` (`confidence_score`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `analytics_snapshots`
--

DROP TABLE IF EXISTS `analytics_snapshots`;
CREATE TABLE IF NOT EXISTS `analytics_snapshots` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lecturer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `snapshot_date` datetime NOT NULL,
  `period` enum('daily','weekly','monthly') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'daily',
  `total_students` int NOT NULL DEFAULT '0',
  `students_submitted` int NOT NULL DEFAULT '0',
  `average_score` decimal(8,2) NOT NULL DEFAULT '0.00',
  `median_score` decimal(8,2) NOT NULL DEFAULT '0.00',
  `std_deviation` decimal(8,2) NOT NULL DEFAULT '0.00',
  `min_score` decimal(8,2) DEFAULT NULL,
  `max_score` decimal(8,2) DEFAULT NULL,
  `total_questions` int NOT NULL DEFAULT '0',
  `average_difficulty` decimal(5,2) NOT NULL DEFAULT '0.00',
  `difficulty_distribution` json DEFAULT NULL,
  `bloom_level_distribution` json DEFAULT NULL,
  `questions_auto_graded` int NOT NULL DEFAULT '0',
  `questions_ai_graded` int NOT NULL DEFAULT '0',
  `average_confidence` decimal(5,2) NOT NULL DEFAULT '0.00',
  `grades_pending_review` int NOT NULL DEFAULT '0',
  `grades_approved` int NOT NULL DEFAULT '0',
  `grades_overridden` int NOT NULL DEFAULT '0',
  `average_time_spent` decimal(8,2) NOT NULL DEFAULT '0.00',
  `early_submissions` int NOT NULL DEFAULT '0',
  `last_minute_submissions` int NOT NULL DEFAULT '0',
  `average_autosave_frequency` decimal(8,2) NOT NULL DEFAULT '0.00',
  `question_performance` json DEFAULT NULL,
  `skill_mastery` json DEFAULT NULL,
  `common_mistakes` json DEFAULT NULL,
  `class_average_change` decimal(8,2) DEFAULT NULL,
  `pass_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `improvement_count` int NOT NULL DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `analytics_snapshots_exam_id_snapshot_date_index` (`exam_id`,`snapshot_date`),
  KEY `analytics_snapshots_course_id_period_index` (`course_id`,`period`),
  KEY `analytics_snapshots_lecturer_id_snapshot_date_index` (`lecturer_id`,`snapshot_date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `school_id` bigint UNSIGNED NOT NULL,
  `course_id` bigint UNSIGNED DEFAULT NULL,
  `posted_by` bigint UNSIGNED NOT NULL,
  `priority` enum('low','medium','high','normal','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `target_type` enum('all_students','all_lecturers','specific_course','specific_class') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all_students',
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `sender_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `announcements_school_id_foreign` (`school_id`),
  KEY `announcements_course_id_foreign` (`course_id`),
  KEY `announcements_posted_by_foreign` (`posted_by`),
  KEY `announcements_sender_id_foreign` (`sender_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
CREATE TABLE IF NOT EXISTS `assignments` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `course_id` bigint UNSIGNED NOT NULL,
  `lecturer_id` bigint UNSIGNED NOT NULL,
  `due_date` datetime NOT NULL,
  `max_score` int DEFAULT NULL,
  `status` enum('draft','published','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assignments_course_id_foreign` (`course_id`),
  KEY `assignments_lecturer_id_foreign` (`lecturer_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
CREATE TABLE IF NOT EXISTS `attendances` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` bigint UNSIGNED NOT NULL,
  `student_id` bigint UNSIGNED NOT NULL,
  `lecturer_id` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `status` enum('present','absent','late') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `attendance_course_id_foreign` (`course_id`),
  KEY `attendance_student_id_foreign` (`student_id`),
  KEY `attendance_lecturer_id_foreign` (`lecturer_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendances`
--

INSERT INTO `attendances` (`id`, `course_id`, `student_id`, `lecturer_id`, `date`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 13, 5, '2025-11-13', 'present', '2025-11-13 16:57:15', '2025-11-13 16:57:15'),
(2, 3, 14, 5, '2025-11-13', 'present', '2025-11-13 16:57:15', '2025-11-13 16:57:15'),
(3, 3, 13, 5, '2025-11-14', 'present', '2025-11-14 22:17:20', '2025-11-14 22:17:20'),
(4, 3, 14, 5, '2025-11-14', 'present', '2025-11-14 22:17:20', '2025-11-14 22:17:20'),
(5, 3, 17, 5, '2025-11-14', 'present', '2025-11-14 22:17:20', '2025-11-14 22:17:20'),
(6, 3, 13, 5, '2025-11-15', 'present', '2025-11-14 22:20:56', '2025-11-14 22:20:56'),
(7, 3, 14, 5, '2025-11-15', 'absent', '2025-11-14 22:20:56', '2025-11-14 22:20:56'),
(8, 3, 17, 5, '2025-11-15', 'present', '2025-11-14 22:20:56', '2025-11-14 22:20:56');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
CREATE TABLE IF NOT EXISTS `classes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `school_id` bigint UNSIGNED NOT NULL,
  `status` enum('active','inactive','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `classes_school_id_foreign` (`school_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `description`, `school_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Grade A', NULL, 2, 'active', '2025-11-11 19:21:08', '2025-11-11 19:21:08'),
(3, 'Grade B', NULL, 2, 'active', '2025-11-11 20:14:41', '2025-11-11 20:14:41');

-- --------------------------------------------------------

--
-- Table structure for table `class_comparison_data`
--

DROP TABLE IF EXISTS `class_comparison_data`;
CREATE TABLE IF NOT EXISTS `class_comparison_data` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comparison_date` timestamp NOT NULL,
  `comparison_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_average` decimal(8,2) NOT NULL DEFAULT '0.00',
  `median_score` decimal(8,2) NOT NULL DEFAULT '0.00',
  `pass_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `high_achiever_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `benchmark_average` decimal(8,2) DEFAULT NULL,
  `benchmark_pass_rate` decimal(5,2) DEFAULT NULL,
  `performance_gap` decimal(8,2) DEFAULT NULL,
  `score_distribution` json DEFAULT NULL,
  `performance_vs_benchmark` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `class_comparison_data_course_id_foreign` (`course_id`),
  KEY `class_comparison_data_exam_id_course_id_index` (`exam_id`,`course_id`),
  KEY `class_comparison_data_comparison_date_index` (`comparison_date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `class_courses`
--

DROP TABLE IF EXISTS `class_courses`;
CREATE TABLE IF NOT EXISTS `class_courses` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `class_id` bigint UNSIGNED NOT NULL,
  `course_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_courses_class_id_course_id_unique` (`class_id`,`course_id`),
  KEY `class_courses_course_id_foreign` (`course_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `class_courses`
--

INSERT INTO `class_courses` (`id`, `class_id`, `course_id`, `created_at`, `updated_at`) VALUES
(5, 1, 3, '2025-11-13 16:23:36', '2025-11-13 16:23:36');

-- --------------------------------------------------------

--
-- Table structure for table `class_students`
--

DROP TABLE IF EXISTS `class_students`;
CREATE TABLE IF NOT EXISTS `class_students` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `school_class_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_students_school_class_id_user_id_unique` (`school_class_id`,`user_id`),
  KEY `class_students_user_id_foreign` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
CREATE TABLE IF NOT EXISTS `courses` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `school_id` bigint UNSIGNED NOT NULL,
  `course_link` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `course_rep_id` bigint UNSIGNED DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `status` enum('active','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courses_school_id_foreign` (`school_id`),
  KEY `courses_course_rep_id_foreign` (`course_rep_id`),
  KEY `courses_created_by_foreign` (`created_by`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`, `code`, `description`, `school_id`, `course_link`, `course_rep_id`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(3, 'Computer Science', 'skeeme.com/enroll/computer-science-6CmmY3', '', 2, 'skeeme.com/enroll/SwkPfl9Y', 13, 2, 'active', '2025-11-13 16:19:47', '2025-11-13 16:19:47');

-- --------------------------------------------------------

--
-- Table structure for table `course_lecturers`
--

DROP TABLE IF EXISTS `course_lecturers`;
CREATE TABLE IF NOT EXISTS `course_lecturers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_lecturers_course_id_user_id_unique` (`course_id`,`user_id`),
  KEY `course_lecturers_course_id_foreign` (`course_id`),
  KEY `course_lecturers_user_id_foreign` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `course_lecturers`
--

INSERT INTO `course_lecturers` (`id`, `course_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 3, 5, '2025-11-13 16:23:53', '2025-11-13 16:23:53');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` bigint UNSIGNED NOT NULL,
  `course_id` bigint UNSIGNED NOT NULL,
  `class_id` bigint UNSIGNED DEFAULT NULL,
  `enrolled_at` date NOT NULL,
  `status` enum('active','inactive','completed','dropped') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollments_student_id_course_id_unique` (`student_id`,`course_id`),
  KEY `enrollments_course_id_foreign` (`course_id`),
  KEY `enrollments_class_id_foreign` (`class_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `class_id`, `enrolled_at`, `status`, `created_at`, `updated_at`) VALUES
(5, 14, 3, 1, '2025-11-13', 'active', '2025-11-13 16:23:36', '2025-11-13 16:23:36'),
(4, 13, 3, 1, '2025-11-13', 'active', '2025-11-13 16:23:36', '2025-11-13 16:23:36'),
(6, 17, 3, 1, '2025-11-13', 'active', '2025-11-13 18:11:12', '2025-11-13 18:11:12');

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
CREATE TABLE IF NOT EXISTS `exams` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` bigint UNSIGNED NOT NULL,
  `lecturer_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `exam_date` datetime NOT NULL,
  `duration` int DEFAULT NULL,
  `total_marks` int DEFAULT NULL,
  `questions` json DEFAULT NULL,
  `status` enum('draft','published','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exams_course_id_foreign` (`course_id`),
  KEY `exams_lecturer_id_foreign` (`lecturer_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`id`, `course_id`, `lecturer_id`, `title`, `description`, `exam_date`, `duration`, `total_marks`, `questions`, `status`, `created_at`, `updated_at`) VALUES
(3, 3, 5, 'Test', '', '2025-11-28 19:34:00', 120, 100, '[]', 'draft', '2025-11-25 17:35:58', '2025-11-27 08:47:49');

-- --------------------------------------------------------

--
-- Table structure for table `exam_answers`
--

DROP TABLE IF EXISTS `exam_answers`;
CREATE TABLE IF NOT EXISTS `exam_answers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `exam_session_id` bigint UNSIGNED NOT NULL,
  `question_index` int NOT NULL,
  `question_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_answer` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `marks_obtained` decimal(8,2) DEFAULT NULL,
  `marking_status` enum('not_marked','auto_marked','ai_graded','manual_graded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_marked',
  `grading_details` json DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `answered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `exam_answers_exam_session_id_index` (`exam_session_id`),
  KEY `exam_answers_marking_status_index` (`marking_status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_questions`
--

DROP TABLE IF EXISTS `exam_questions`;
CREATE TABLE IF NOT EXISTS `exam_questions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `exam_id` bigint UNSIGNED NOT NULL,
  `question_id` bigint UNSIGNED NOT NULL,
  `order` int NOT NULL DEFAULT '0',
  `marks` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_questions_exam_id_question_id_unique` (`exam_id`,`question_id`),
  KEY `exam_questions_question_id_foreign` (`question_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_questions`
--

INSERT INTO `exam_questions` (`id`, `exam_id`, `question_id`, `order`, `marks`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 1, 2.00, '2025-11-27 11:22:55', '2025-11-27 16:43:13');

-- --------------------------------------------------------

--
-- Table structure for table `exam_sessions`
--

DROP TABLE IF EXISTS `exam_sessions`;
CREATE TABLE IF NOT EXISTS `exam_sessions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `exam_id` bigint UNSIGNED NOT NULL,
  `student_id` bigint UNSIGNED NOT NULL,
  `status` enum('not_started','in_progress','submitted','graded','abandoned') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_started',
  `started_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `time_spent_seconds` int NOT NULL DEFAULT '0',
  `questions_answered` int NOT NULL DEFAULT '0',
  `score` decimal(8,2) DEFAULT NULL,
  `answers` json DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exam_sessions_exam_id_student_id_unique` (`exam_id`,`student_id`),
  KEY `exam_sessions_status_index` (`status`),
  KEY `exam_sessions_student_id_index` (`student_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
CREATE TABLE IF NOT EXISTS `grades` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` bigint UNSIGNED NOT NULL,
  `course_id` bigint UNSIGNED NOT NULL,
  `exam_id` bigint UNSIGNED DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `grade` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `graded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grades_student_id_foreign` (`student_id`),
  KEY `grades_course_id_foreign` (`course_id`),
  KEY `grades_exam_id_foreign` (`exam_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grading_trends`
--

DROP TABLE IF EXISTS `grading_trends`;
CREATE TABLE IF NOT EXISTS `grading_trends` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lecturer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trend_date` datetime NOT NULL,
  `period` enum('hourly','daily','weekly') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'daily',
  `mcq_graded_count` int NOT NULL DEFAULT '0',
  `mcq_average_score` decimal(8,2) NOT NULL DEFAULT '0.00',
  `essays_graded_count` int NOT NULL DEFAULT '0',
  `essays_average_score` decimal(8,2) NOT NULL DEFAULT '0.00',
  `essays_average_confidence` decimal(5,2) NOT NULL DEFAULT '0.00',
  `overrides_count` int NOT NULL DEFAULT '0',
  `override_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `override_patterns` json DEFAULT NULL,
  `average_grading_time` decimal(8,2) NOT NULL DEFAULT '0.00',
  `grades_per_hour` int NOT NULL DEFAULT '0',
  `consistency_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grading_trends_exam_id_trend_date_index` (`exam_id`,`trend_date`),
  KEY `grading_trends_lecturer_id_period_index` (`lecturer_id`,`period`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `school_id` bigint UNSIGNED NOT NULL,
  `subscription_id` bigint UNSIGNED NOT NULL,
  `invoice_number` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `invoice_date` date NOT NULL,
  `due_date` date NOT NULL,
  `paid_date` date DEFAULT NULL,
  `status` enum('draft','sent','paid','overdue','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `description` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `file_path` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
  KEY `invoices_school_id_foreign` (`school_id`),
  KEY `invoices_subscription_id_foreign` (`subscription_id`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `school_id`, `subscription_id`, `invoice_number`, `plan_name`, `amount`, `currency`, `invoice_date`, `due_date`, `paid_date`, `status`, `description`, `notes`, `file_path`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 2, 2, 'INV-20251128-00001', 'Pro', 59.99, 'USD', '2025-11-28', '2025-12-28', '2025-11-28', 'paid', 'Monthly subscription for Pro', NULL, NULL, '2025-11-28 11:28:04', '2025-11-28 11:28:04', NULL),
(2, 2, 2, 'INV-20251128-00002', 'Pro', 59.99, 'USD', '2025-11-28', '2025-12-05', '2025-11-28', 'paid', 'Test payment for Paystack integration', NULL, NULL, '2025-11-28 13:57:17', '2025-11-28 13:57:17', NULL),
(13, 1, 1, 'INV-20251129-00003', 'Pro', 543901.00, 'NGN', '2025-11-29', '2025-12-06', NULL, 'draft', 'Upgrade to Pro plan (biannual)', NULL, 'invoices/Invoice-INV-20251129-00003-1764531668.pdf', '2025-11-29 18:28:07', '2025-11-30 18:41:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sender_id` bigint UNSIGNED NOT NULL,
  `receiver_id` bigint UNSIGNED NOT NULL,
  `course_id` bigint UNSIGNED DEFAULT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_sender_id_foreign` (`sender_id`),
  KEY `messages_receiver_id_foreign` (`receiver_id`),
  KEY `messages_course_id_foreign` (`course_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(51, '2025_11_29_add_payment_retry_columns', 18),
(50, '2025_11_28_add_paystack_fields_to_payments', 17),
(49, '2025_11_28_120118_create_payments_table', 16),
(48, '2025_11_28_120112_create_invoices_table', 16),
(47, '2025_11_28_115612_update_subscription_prices_to_usd', 15),
(46, '2025_11_28_000001_add_admin_settings_columns_to_schools_and_subscriptions', 14),
(45, '2025_11_27_121848_remove_topic_from_questions_table', 13),
(44, '2025_11_27_121747_make_question_pool_id_nullable_in_questions_table', 12),
(43, '2025_11_27_000003_create_exam_questions_table', 11),
(42, '2025_11_27_000002_add_question_bank_fields_to_questions', 10),
(41, '2025_11_27_000001_create_question_banks_table', 9),
(40, '2025_11_25_000007_create_analytics_tables', 8),
(39, '2025_11_25_000006_create_ai_gradings_table', 7),
(38, '2025_11_25_000005_add_embeddings_to_notes', 6),
(37, '2025_11_25_000004_create_questions_table', 5),
(36, '2025_11_25_000003_create_question_pools_table', 4),
(35, '2025_11_25_000002_create_exam_answers_table', 3),
(33, '0001_create_jobs_table', 1),
(34, '2025_11_25_000001_create_exam_sessions_table', 2),
(52, '2025_12_01_000001_add_onboarding_fields_to_users', 19),
(53, '2025_12_02_000001_make_role_nullable_in_users', 20);

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
CREATE TABLE IF NOT EXISTS `notes` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` bigint UNSIGNED NOT NULL,
  `lecturer_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text_content` longtext COLLATE utf8mb4_unicode_ci,
  `embedding_status` enum('pending','processing','completed','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `ingested_at` timestamp NULL DEFAULT NULL,
  `topic_id` bigint UNSIGNED DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notes_course_id_foreign` (`course_id`),
  KEY `notes_lecturer_id_foreign` (`lecturer_id`),
  KEY `notes_topic_id_foreign` (`topic_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_read_index` (`user_id`,`read`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `parent_tokens`
--

DROP TABLE IF EXISTS `parent_tokens`;
CREATE TABLE IF NOT EXISTS `parent_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` bigint UNSIGNED NOT NULL,
  `token` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `parent_tokens_token_unique` (`token`),
  KEY `parent_tokens_student_id_foreign` (`student_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `school_id` bigint UNSIGNED NOT NULL,
  `subscription_id` bigint UNSIGNED NOT NULL,
  `invoice_id` bigint UNSIGNED DEFAULT NULL,
  `transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `status` enum('pending','completed','failed','refunded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `metadata` text COLLATE utf8mb4_unicode_ci,
  `paid_at` timestamp NULL DEFAULT NULL,
  `failure_reason` text COLLATE utf8mb4_unicode_ci,
  `retry_count` int UNSIGNED NOT NULL DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `authorization_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_4` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `card_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_transaction_id_unique` (`transaction_id`),
  KEY `payments_school_id_foreign` (`school_id`),
  KEY `payments_subscription_id_foreign` (`subscription_id`),
  KEY `payments_invoice_id_foreign` (`invoice_id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `school_id`, `subscription_id`, `invoice_id`, `transaction_id`, `payment_method`, `amount`, `currency`, `status`, `metadata`, `paid_at`, `failure_reason`, `retry_count`, `notes`, `authorization_code`, `customer_code`, `last_4`, `card_type`, `created_at`, `updated_at`) VALUES
(1, 2, 2, 1, 'PAY-20251128122804-31F9F4', 'paystack', 59.99, 'USD', 'completed', NULL, '2025-11-28 11:28:04', NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-28 11:28:04', '2025-11-28 11:28:04'),
(2, 2, 2, 2, 'TEST-1764341837', 'paystack', 59.99, 'USD', 'completed', '\"{\\\"test\\\":true,\\\"error\\\":\\\"cURL error 60: SSL certificate problem: unable to get local issuer certificate (see https:\\\\\\/\\\\\\/curl.haxx.se\\\\\\/libcurl\\\\\\/c\\\\\\/libcurl-errors.html) for https:\\\\\\/\\\\\\/api.paystack.co\\\\\\/transaction\\\\\\/initialize\\\"}\"', '2025-11-28 13:57:17', NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-28 13:57:17', '2025-11-28 13:57:17'),
(3, 1, 1, 5, 'k7hqkuf4wt', 'paystack', 59.99, 'USD', 'pending', '\"{\\\"authorization_url\\\":\\\"https:\\\\\\/\\\\\\/checkout.paystack.com\\\\\\/xoq8u58w87wolf5\\\",\\\"access_code\\\":\\\"xoq8u58w87wolf5\\\"}\"', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-28 18:07:37', '2025-11-28 18:07:37'),
(4, 1, 1, 6, 'ijvvptisse', 'paystack', 59.99, 'USD', 'pending', '\"{\\\"authorization_url\\\":\\\"https:\\\\\\/\\\\\\/checkout.paystack.com\\\\\\/xvh1856pek3p3v5\\\",\\\"access_code\\\":\\\"xvh1856pek3p3v5\\\"}\"', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-28 18:09:10', '2025-11-28 18:09:10'),
(5, 1, 1, 7, 'mvowdscorb', 'paystack', 98983.50, 'NGN', 'pending', '\"{\\\"authorization_url\\\":\\\"https:\\\\\\/\\\\\\/checkout.paystack.com\\\\\\/xl3q0gszhhprmic\\\",\\\"access_code\\\":\\\"xl3q0gszhhprmic\\\"}\"', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-28 18:12:15', '2025-11-28 18:12:15'),
(6, 1, 1, 8, '8kact0g4bg', 'paystack', 1087802.00, 'NGN', 'pending', '\"{\\\"authorization_url\\\":\\\"https:\\\\\\/\\\\\\/checkout.paystack.com\\\\\\/orw994tuf1yh9b6\\\",\\\"access_code\\\":\\\"orw994tuf1yh9b6\\\",\\\"billing_period\\\":\\\"annual\\\"}\"', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-29 14:04:18', '2025-11-29 14:04:18'),
(7, 1, 1, 9, 'ye3i8j4ng4', 'paystack', 543901.00, 'NGN', 'pending', '\"{\\\"authorization_url\\\":\\\"https:\\\\\\/\\\\\\/checkout.paystack.com\\\\\\/t8vj51kkgiu6iwy\\\",\\\"access_code\\\":\\\"t8vj51kkgiu6iwy\\\",\\\"billing_period\\\":\\\"biannual\\\"}\"', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-29 14:08:04', '2025-11-29 14:08:04'),
(8, 1, 1, 10, 'asslp65l6o', 'paystack', 543901.00, 'NGN', 'pending', '\"{\\\"authorization_url\\\":\\\"https:\\\\\\/\\\\\\/checkout.paystack.com\\\\\\/fk4zpswl232f6et\\\",\\\"access_code\\\":\\\"fk4zpswl232f6et\\\",\\\"billing_period\\\":\\\"biannual\\\"}\"', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-29 14:13:20', '2025-11-29 14:13:20'),
(9, 1, 1, 11, '9sfgnfg51w', 'paystack', 543901.00, 'NGN', 'pending', '\"{\\\"authorization_url\\\":\\\"https:\\\\\\/\\\\\\/checkout.paystack.com\\\\\\/nany2i8t3phz1zr\\\",\\\"access_code\\\":\\\"nany2i8t3phz1zr\\\",\\\"billing_period\\\":\\\"biannual\\\"}\"', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-29 14:21:07', '2025-11-29 14:21:07'),
(10, 1, 1, 12, 'pqoamutojm', 'paystack', 543901.00, 'NGN', 'pending', '\"{\\\"authorization_url\\\":\\\"https:\\\\\\/\\\\\\/checkout.paystack.com\\\\\\/6yi8bl90xjtv3l2\\\",\\\"access_code\\\":\\\"6yi8bl90xjtv3l2\\\",\\\"billing_period\\\":\\\"biannual\\\"}\"', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-29 14:32:36', '2025-11-29 14:32:36'),
(11, 1, 1, 13, 'wq4dbdv4da', 'paystack', 543901.00, 'NGN', 'pending', '\"{\\\"authorization_url\\\":\\\"https:\\\\\\/\\\\\\/checkout.paystack.com\\\\\\/akuso0qekock8ku\\\",\\\"access_code\\\":\\\"akuso0qekock8ku\\\",\\\"billing_period\\\":\\\"biannual\\\"}\"', NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, '2025-11-29 18:28:08', '2025-11-29 18:28:08');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
CREATE TABLE IF NOT EXISTS `questions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `question_pool_id` bigint UNSIGNED DEFAULT NULL,
  `question_bank_id` bigint UNSIGNED DEFAULT NULL,
  `uuid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` json DEFAULT NULL,
  `correct_answer` json DEFAULT NULL,
  `marks` decimal(8,2) NOT NULL DEFAULT '1.00',
  `bloom_level` enum('remember','understand','apply','analyze','evaluate','create') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'understand',
  `difficulty_level` enum('easy','medium','hard') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `learning_objective` text COLLATE utf8mb4_unicode_ci,
  `explanation` text COLLATE utf8mb4_unicode_ci,
  `source` enum('manual','ai_generated','imported') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `usage_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `questions_uuid_unique` (`uuid`),
  KEY `questions_question_pool_id_index` (`question_pool_id`),
  KEY `questions_bloom_level_index` (`bloom_level`),
  KEY `questions_question_type_index` (`question_type`),
  KEY `questions_question_bank_id_foreign` (`question_bank_id`),
  KEY `questions_created_by_foreign` (`created_by`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `question_pool_id`, `question_bank_id`, `uuid`, `question_type`, `question_text`, `options`, `correct_answer`, `marks`, `bloom_level`, `difficulty_level`, `learning_objective`, `explanation`, `source`, `created_by`, `metadata`, `status`, `usage_count`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, '49ea837a-052e-4967-a510-fc4600f21d9e', 'true_false', '10 in Base 2 is 1010₂', '[\"\", \"\", \"\", \"\"]', '\"true\"', 1.00, 'understand', 'medium', '', '', 'manual', 5, NULL, 'draft', 0, '2025-11-27 11:22:55', '2025-11-27 17:26:36');

-- --------------------------------------------------------

--
-- Table structure for table `question_analytics`
--

DROP TABLE IF EXISTS `question_analytics`;
CREATE TABLE IF NOT EXISTS `question_analytics` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exam_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_attempts` int NOT NULL DEFAULT '0',
  `correct_attempts` int NOT NULL DEFAULT '0',
  `correct_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `bloom_level` int DEFAULT NULL,
  `difficulty_index` decimal(5,2) NOT NULL DEFAULT '0.00',
  `discrimination_index` decimal(5,2) NOT NULL DEFAULT '0.00',
  `option_selection_count` json DEFAULT NULL,
  `common_distractors` json DEFAULT NULL,
  `average_time_spent` decimal(8,2) NOT NULL DEFAULT '0.00',
  `last_used_at` timestamp NULL DEFAULT NULL,
  `uses_count` int NOT NULL DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `question_analytics_exam_id_foreign` (`exam_id`),
  KEY `question_analytics_question_id_exam_id_index` (`question_id`,`exam_id`),
  KEY `question_analytics_difficulty_index_index` (`difficulty_index`),
  KEY `question_analytics_correct_rate_index` (`correct_rate`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `question_banks`
--

DROP TABLE IF EXISTS `question_banks`;
CREATE TABLE IF NOT EXISTS `question_banks` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_by` bigint UNSIGNED NOT NULL,
  `status` enum('active','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `question_banks_course_id_foreign` (`course_id`),
  KEY `question_banks_created_by_foreign` (`created_by`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `question_banks`
--

INSERT INTO `question_banks` (`id`, `course_id`, `name`, `description`, `created_by`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 'Default Question Bank', NULL, 5, 'active', '2025-11-27 11:01:59', '2025-11-27 11:01:59');

-- --------------------------------------------------------

--
-- Table structure for table `question_pools`
--

DROP TABLE IF EXISTS `question_pools`;
CREATE TABLE IF NOT EXISTS `question_pools` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` bigint UNSIGNED NOT NULL,
  `lecturer_id` bigint UNSIGNED NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','published','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `total_questions` int NOT NULL DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `question_pools_course_id_foreign` (`course_id`),
  KEY `question_pools_lecturer_id_index` (`lecturer_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `scheme_of_work`
--

DROP TABLE IF EXISTS `scheme_of_work`;
CREATE TABLE IF NOT EXISTS `scheme_of_work` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` bigint UNSIGNED NOT NULL,
  `week_number` int NOT NULL,
  `topic` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `objectives` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `resources` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','in_progress','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `scheme_of_work_course_id_foreign` (`course_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `scheme_of_work`
--

INSERT INTO `scheme_of_work` (`id`, `course_id`, `week_number`, `topic`, `description`, `objectives`, `resources`, `status`, `created_at`, `updated_at`) VALUES
(6, 3, 1, 'Introduction', '', NULL, NULL, 'in_progress', '2025-11-14 23:20:12', '2025-11-14 23:20:12'),
(7, 3, 2, 'Drivers', '', NULL, NULL, 'in_progress', '2025-11-14 23:25:06', '2025-11-14 23:25:06'),
(8, 3, 3, 'Test Week', '', NULL, NULL, 'pending', '2025-11-14 23:35:34', '2025-11-14 23:35:34');

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

DROP TABLE IF EXISTS `schools`;
CREATE TABLE IF NOT EXISTS `schools` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UTC',
  `language` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'en',
  `grading_scale` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0-100',
  `logo_path` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `academic_year` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allow_student_password_change` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`id`, `name`, `address`, `email`, `website`, `timezone`, `language`, `grading_scale`, `logo_path`, `phone`, `academic_year`, `allow_student_password_change`, `created_at`, `updated_at`) VALUES
(1, 'Demo School', '123 Education Street', 'demo@school.com', '', 'Africa/Lagos', 'en', '5.0', NULL, '+1234567890', '2024-2025', 1, '2025-11-11 19:10:05', '2025-11-29 12:43:27'),
(2, 'Kantrol Academy', '456 Learning Avenue', 'pro@school.com', '', 'Africa/Lagos', 'en', '0-100', NULL, '+0987654321', '2025-2026', 1, '2025-11-11 19:10:05', '2025-11-28 10:41:51');

-- --------------------------------------------------------

--
-- Table structure for table `security_logs`
--

DROP TABLE IF EXISTS `security_logs`;
CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `security_logs_user_id_foreign` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('zddamWpiXgmmL2ArvAW2NfBGfo8yPs4MKGkCxE65', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiOWw2VXpQQjBKRm10WlVZRDBlRU5lVkFnYWRIMkJOWU1LZENhZmVaZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDk6Imh0dHBzOi8vc2tlZW1lLnRlc3Qvc2V0dGluZ3Mvc3Vic2NyaXB0aW9uLWJpbGxpbmciO3M6NToicm91dGUiO3M6Mjk6InNldHRpbmdzLnN1YnNjcmlwdGlvbi1iaWxsaW5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9', 1764617529),
('zNihXu3lr9eMJ04DLT8RAM0VhR8mkUx5O0dBSsjg', 30, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiVlRqVlZZOGZmWjMybGViQWozUHJrQUZrVTExMUVNTmt4M1JEVzZnNyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHBzOi8vc2tlZW1lLnRlc3Qvcm9sZS1zZWxlY3Rpb24iO3M6NToicm91dGUiO3M6MTQ6InJvbGUtc2VsZWN0aW9uIjt9czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MzA7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozNDoiaHR0cHM6Ly9za2VlbWUudGVzdC9yb2xlLXNlbGVjdGlvbiI7fX0=', 1764682915),
('Y84jMklXF5amDNJrKFmrHB2zFttz4lNGqjEdSvfQ', 25, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiTlY0TEcyVmx2REZYWUpTNG03MTJkTUxobnRQTldJWTAxVGRlTzIyMCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2tlZW1lLnRlc3QvbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToyNTtzOjM6InVybCI7YToxOntzOjg6ImludGVuZGVkIjtzOjM0OiJodHRwczovL3NrZWVtZS50ZXN0L3N0dWRlbnQvZ3JhZGVzIjt9fQ==', 1764680516),
('teRuobBlynpscvABdFwmVVMLbI4DbXpVIiHtTuFZ', 5, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiUHliOXhvNkRJT3dTa0FBeFJKek1LclpDdlJPYVRWRWZYb1RDZjFOViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjk6Imh0dHBzOi8vc2tlZW1lLnRlc3QvZGFzaGJvYXJkIjtzOjU6InJvdXRlIjtzOjk6ImRhc2hib2FyZCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjU7fQ==', 1764618683),
('zdkaiZdfKVt6H08qT6KKB2tii5uFpT8iTE1QUYW7', 2, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiQ2lWS1ZpRmhaV2FOZzdOVUttWVNGOGNhcEwwbk44V3k5NTEzd3BhOSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mzk6Imh0dHBzOi8vc2tlZW1lLnRlc3QvbGVjdHVyZXItbWFuYWdlbWVudCI7czo1OiJyb3V0ZSI7czoxOToibGVjdHVyZXItbWFuYWdlbWVudCI7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjI7czozOiJ1cmwiO2E6MTp7czo4OiJpbnRlbmRlZCI7czozOToiaHR0cHM6Ly9za2VlbWUudGVzdC9zZXR0aW5ncy90d28tZmFjdG9yIjt9fQ==', 1764618699);

-- --------------------------------------------------------

--
-- Table structure for table `student_learning_progress`
--

DROP TABLE IF EXISTS `student_learning_progress`;
CREATE TABLE IF NOT EXISTS `student_learning_progress` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `overall_progress` decimal(5,2) NOT NULL DEFAULT '0.00',
  `mastery_level` decimal(5,2) NOT NULL DEFAULT '0.00',
  `skill_levels` json DEFAULT NULL,
  `average_score_trend` decimal(8,2) NOT NULL DEFAULT '0.00',
  `improvement_streak` int NOT NULL DEFAULT '0',
  `struggle_areas` int NOT NULL DEFAULT '0',
  `exams_completed` int NOT NULL DEFAULT '0',
  `average_completion_time` decimal(8,2) NOT NULL DEFAULT '0.00',
  `times_reviewed_feedback` int NOT NULL DEFAULT '0',
  `recommended_topics` json DEFAULT NULL,
  `strengths` json DEFAULT NULL,
  `weaknesses` json DEFAULT NULL,
  `last_exam_at` timestamp NULL DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_learning_progress_course_id_foreign` (`course_id`),
  KEY `student_learning_progress_student_id_course_id_index` (`student_id`,`course_id`),
  KEY `student_learning_progress_mastery_level_index` (`mastery_level`),
  KEY `student_learning_progress_last_exam_at_index` (`last_exam_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
CREATE TABLE IF NOT EXISTS `submissions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint UNSIGNED NOT NULL,
  `student_id` bigint UNSIGNED NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `score` int DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `submitted_at` datetime NOT NULL,
  `graded_at` datetime DEFAULT NULL,
  `status` enum('submitted','graded','late') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `submissions_assignment_id_student_id_unique` (`assignment_id`,`student_id`),
  KEY `submissions_student_id_foreign` (`student_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `school_id` bigint UNSIGNED NOT NULL,
  `plan_name` enum('Free/Basic Plan','Pro','Enterprise') COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_limit` int DEFAULT '150',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `start_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `status` enum('active','expired','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `auto_renew` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptions_school_id_foreign` (`school_id`),
  KEY `subscriptions_is_active_index` (`is_active`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `school_id`, `plan_name`, `student_limit`, `price`, `start_date`, `expiry_date`, `status`, `is_active`, `auto_renew`, `created_at`, `updated_at`) VALUES
(1, 1, 'Free/Basic Plan', 150, 0.00, '2025-11-11', '2026-11-11', 'active', 1, 0, '2025-11-11 19:10:05', '2025-11-11 19:10:05'),
(2, 2, 'Pro', NULL, 59.99, '2025-11-11', '2025-12-11', 'active', 1, 0, '2025-11-11 19:10:05', '2025-11-11 19:10:05');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `two_factor_secret` text COLLATE utf8mb4_unicode_ci,
  `two_factor_recovery_codes` text COLLATE utf8mb4_unicode_ci,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `school_id` bigint UNSIGNED DEFAULT NULL,
  `approved_by` bigint UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `role` enum('admin','lecturer','student') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','suspended','pending','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `middle_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `parent_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_id` bigint UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_school_id_foreign` (`school_id`),
  KEY `users_class_id_foreign` (`class_id`),
  KEY `users_approved_by_foreign` (`approved_by`)
) ENGINE=MyISAM AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `remember_token`, `created_at`, `updated_at`, `school_id`, `approved_by`, `approved_at`, `role`, `status`, `first_name`, `last_name`, `phone_number`, `middle_name`, `address`, `parent_token`, `class_id`) VALUES
(1, 'Demo Admin', 'admin@demo.com', '2025-11-11 19:10:05', '$2y$12$0pfLmDAxUPOnVYX7yInKd.5L/fcLqco/2bFOuoQWrfcDX63Rsj07K', NULL, NULL, NULL, '1CKr48eMLTwDg9ceNR0qTeafJklNmBBVg4VsNOtfXaBtvO4N3GFeTzIGv5Ya', '2025-11-11 19:10:05', '2025-11-11 19:10:05', 1, NULL, NULL, 'admin', 'active', 'Demo', 'Admin', NULL, NULL, NULL, NULL, NULL),
(2, 'Pro Admin', 'admin@pro.com', '2025-11-11 19:10:06', '$2y$12$ezXZftnUp3GrXnqXT4qPPeMFf6onITWXYdQnXw9FSY8qMSsp7xdQG', NULL, NULL, NULL, 'jU2uLt8uBE3UOTuY3r1kgwNcGyLc0L9CwbchiI6bjdH4Q0w5qGRp4Itg278Z', '2025-11-11 19:10:06', '2025-11-28 10:41:45', 2, NULL, NULL, 'admin', 'active', 'Pro', 'Admin', NULL, NULL, NULL, NULL, NULL),
(3, 'John Lecturer', 'lecturer1@demo.com', '2025-11-11 19:10:06', '$2y$12$LJsxBinMrt7KsH48hNYumufhImQ.ip88Pv7KAzQwVxtGOVAV36yAq', NULL, NULL, NULL, NULL, '2025-11-11 19:10:06', '2025-11-11 19:10:06', 1, NULL, NULL, 'lecturer', 'active', 'John', 'Lecturer', NULL, NULL, NULL, NULL, NULL),
(4, 'Jane Lecturer', 'lecturer2@demo.com', '2025-11-11 19:10:07', '$2y$12$AImtHuSSReH0lKI503zLSuH0gz6v1aOz1VYuRJ3M5ynpyxAj2jj7y', NULL, NULL, NULL, NULL, '2025-11-11 19:10:07', '2025-11-11 19:10:07', 1, NULL, NULL, 'lecturer', 'active', 'Jane', 'Lecturer', NULL, NULL, NULL, NULL, NULL),
(5, 'Bob Teest', 'lecturer1@pro.com', '2025-11-11 19:10:07', '$2y$12$EGTaQStdpIhzIlZ1mL.lS.AKMOPMXxWnsq9vrUQ1894kgnwsJHUeW', NULL, NULL, NULL, 'Fvv3v6jj8dT1K6lmFgKepUjeEcOsY74VLhSSFLGaGfqA3LUJqRbawjgNnXoh', '2025-11-11 19:10:07', '2025-11-12 19:57:03', 2, NULL, NULL, 'lecturer', 'active', 'Bob', 'Lecturer', NULL, NULL, NULL, NULL, NULL),
(6, 'Carol Lecturer', 'lecturer2@pro.com', '2025-11-11 19:10:07', '$2y$12$O4etpAg97j5URTrvBQqU0OYPZkNIUhSzBGOes0BDFqKQDm.Qr6M16', NULL, NULL, NULL, NULL, '2025-11-11 19:10:07', '2025-11-11 19:10:07', 2, NULL, NULL, 'lecturer', 'active', 'Carol', 'Lecturer', NULL, NULL, NULL, NULL, NULL),
(7, 'David Lecturer', 'lecturer3@pro.com', '2025-11-11 19:10:08', '$2y$12$XeMmC./nBqzLnYmzo4fFq.PZM1NFQAGRMTT71TtAi65DhXVI/kvxi', NULL, NULL, NULL, NULL, '2025-11-11 19:10:08', '2025-11-11 19:10:08', 2, NULL, NULL, 'lecturer', 'active', 'David', 'Lecturer', NULL, NULL, NULL, NULL, NULL),
(8, 'Emma Lecturer', 'lecturer4@pro.com', '2025-11-11 19:10:08', '$2y$12$L3uN8hmabLtmlqUu4PLleuZm.LBrCN9cPZqLpIqhi.HRVYXP4fxqq', NULL, NULL, NULL, NULL, '2025-11-11 19:10:08', '2025-11-11 19:10:08', 2, NULL, NULL, 'lecturer', 'active', 'Emma', 'Lecturer', NULL, NULL, NULL, NULL, NULL),
(9, 'Frank Lecturer', 'lecturer5@pro.com', '2025-11-11 19:10:09', '$2y$12$GbquHdprqYdCapYbrUEzs.A3kRN6OOYMZx8o1.cgszU/32TVOpZZu', NULL, NULL, NULL, NULL, '2025-11-11 19:10:09', '2025-11-11 19:10:09', 2, NULL, NULL, 'lecturer', 'active', 'Frank', 'Lecturer', NULL, NULL, NULL, NULL, NULL),
(10, 'Alice Student', 'student1@demo.com', '2025-11-11 19:10:09', '$2y$12$L.lMZco8vj/ALkXN.M505.VrvaJaKRpZRnWNfYgdC0aU4ItCCZlXm', NULL, NULL, NULL, NULL, '2025-11-11 19:10:09', '2025-11-11 19:10:09', 1, NULL, NULL, 'student', 'active', 'Alice', 'Student', NULL, NULL, NULL, NULL, NULL),
(11, 'Charlie Student', 'student2@demo.com', '2025-11-11 19:10:09', '$2y$12$CU7.G3ic6JgpSrwGCHQcsuc.Q7bCiIp/XpeXLeV3R1qouNrAlUC62', NULL, NULL, NULL, NULL, '2025-11-11 19:10:09', '2025-11-11 19:10:09', 1, NULL, NULL, 'student', 'active', 'Charlie', 'Student', NULL, NULL, NULL, NULL, NULL),
(12, 'Diana Student', 'student3@demo.com', '2025-11-11 19:10:10', '$2y$12$fcYL2xHVSGk2FORlxhRKDOoF666P7.pb6XwtLELPy4OzOdvoFl3ZW', NULL, NULL, NULL, NULL, '2025-11-11 19:10:10', '2025-11-11 19:10:10', 1, NULL, NULL, 'student', 'active', 'Diana', 'Student', NULL, NULL, NULL, NULL, NULL),
(13, 'Eve Student', 'student1@pro.com', '2025-11-11 19:10:10', '$2y$12$n3JPvbDhEN.fJrxGqoZGG.r.wYtEi2DzSh14cdXhk4FVxCu0b9gt.', NULL, NULL, NULL, NULL, '2025-11-11 19:10:10', '2025-11-11 20:14:15', 2, NULL, NULL, 'student', 'active', 'Eve', 'Student', NULL, '', '', NULL, 1),
(14, 'Frank Student', 'student2@pro.com', '2025-11-11 19:10:11', '$2y$12$zMPsBZwtCsJzRtiuUXID3.tT9tNkgknPxuZvLF0bUOXIMUxW2a50S', NULL, NULL, NULL, NULL, '2025-11-11 19:10:11', '2025-11-11 20:14:28', 2, NULL, NULL, 'student', 'active', 'Frank', 'Student', NULL, NULL, NULL, NULL, 1),
(15, 'Inactive Student', 'inactive@student.com', '2025-11-11 19:10:11', '$2y$12$iG8VcMJdk0JjXo97uYWjzeN06NVB.lsMXY1bOQ5tddRgMoHF3OMwq', NULL, NULL, NULL, NULL, '2025-11-11 19:10:11', '2025-11-11 19:10:11', 1, NULL, NULL, 'student', 'inactive', 'Inactive', 'Student', NULL, NULL, NULL, NULL, NULL),
(16, 'Suspended Lecturer', 'suspended@lecturer.com', '2025-11-11 19:10:12', '$2y$12$rtmeV4Hr2JAnTjkmymtLUesxeARxuKaArU10OLcm0tN4kpMLvlgnq', NULL, NULL, NULL, NULL, '2025-11-11 19:10:12', '2025-11-11 19:10:12', 1, NULL, NULL, 'lecturer', 'suspended', 'Suspended', 'Lecturer', NULL, NULL, NULL, NULL, NULL),
(17, 'Parma Mahomes', 'parma.mahomes@skeeme.com', NULL, '$2y$12$C5wKxs42IfT7/6w0pKmeY.YYJ8HyeTQjIAVhPP68d.bB6qQd8954W', NULL, NULL, NULL, 'D0g7k0D1iHLdxeT6LakPssghucxnyH491J1wpI96v4csWvTSbTBcdd9oN4qo', '2025-11-11 20:06:27', '2025-11-13 18:11:12', 2, NULL, NULL, 'student', 'active', 'Parma', 'Mahomes', NULL, '', '', NULL, 1),
(30, 'otuturusolomom@gmail.com', 'otuturusolomom@gmail.com', NULL, '$2y$12$4fm/PakQGcgFe/pYlFnOo.owV4utyQvG5fpq6oGLO.D5/I6XPu.pW', NULL, NULL, NULL, NULL, '2025-12-02 12:23:32', '2025-12-02 12:23:32', NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vector_store_entries`
--

DROP TABLE IF EXISTS `vector_store_entries`;
CREATE TABLE IF NOT EXISTS `vector_store_entries` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `note_id` bigint UNSIGNED NOT NULL,
  `vector_data` json NOT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vector_store_entries_note_id_unique` (`note_id`),
  KEY `vector_store_entries_note_id_index` (`note_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
