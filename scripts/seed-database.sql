-- Seed the database with sample data for testing

-- Insert sample admin users (replace with actual emails)
INSERT INTO admins (id, email, githubId, name, createdAt, updatedAt) VALUES
('admin1', 'admin@example.com', '12345', 'Admin User', NOW(), NOW()),
('admin2', 'admin2@example.com', '12346', 'Admin User 2', NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Insert sample marking schemes for different exams
INSERT INTO marking_schemes (id, examDate, shift, subjectCombination, subject, correctMarks, incorrectMarks, unattemptedMarks, totalQuestions, totalMarks) VALUES
-- NEET 2025
('ms1', '03/06/2025', '03 June Shift 1', 'Combination 1', 'Biology', 4, -1, 0, 50, 200),
('ms2', '03/06/2025', '03 June Shift 1', 'Combination 1', 'Chemistry', 4, -1, 0, 50, 200),
('ms3', '03/06/2025', '03 June Shift 1', 'Combination 1', 'Physics', 4, -1, 0, 50, 200),
('ms4', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Biology', 4, -1, 0, 50, 200),
('ms5', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Chemistry', 4, -1, 0, 50, 200),
('ms6', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Physics', 4, -1, 0, 50, 200),

-- JEE Mains 2025
('ms7', '01/06/2025', '01 June Shift 1', 'Combination 1', 'Mathematics', 4, -1, 0, 30, 120),
('ms8', '01/06/2025', '01 June Shift 1', 'Combination 1', 'Physics', 4, -1, 0, 30, 120),
('ms9', '01/06/2025', '01 June Shift 1', 'Combination 1', 'Chemistry', 4, -1, 0, 30, 120),

-- CUET 2025
('ms10', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Biology', 5, -1, 0, 50, 250),
('ms11', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Chemistry', 5, -1, 0, 50, 250),
('ms12', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Physics', 5, -1, 0, 50, 250)
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Insert sample answer keys
INSERT INTO answer_keys (id, examDate, shift, subjectCombination, subject, answers, isApproved, submittedBy, createdAt, updatedAt) VALUES
('ak1', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Biology', 
'[{"questionId":"226895708462","correctOptions":["3"],"optionIds":["2268952746936"]},{"questionId":"226895708452","correctOptions":["4"],"optionIds":["2268952746897"]}]', 
true, 'admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();
