-- Create the database
CREATE DATABASE IF NOT EXISTS exam_analyzer;
USE exam_analyzer;

-- Insert sample admin users (replace with actual GitHub emails)
INSERT INTO admins (id, email, githubId, name, createdAt, updatedAt) VALUES
('admin1', 'admin@example.com', '12345', 'Admin User', NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Insert sample marking schemes
INSERT INTO marking_schemes (id, examDate, shift, subjectCombination, subject, correctMarks, incorrectMarks, unattemptedMarks, totalQuestions, totalMarks) VALUES
('ms1', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Biology', 5, -1, 0, 50, 250),
('ms2', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Chemistry', 5, -1, 0, 50, 250),
('ms3', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Physics', 5, -1, 0, 50, 250)
ON DUPLICATE KEY UPDATE updatedAt = NOW();
