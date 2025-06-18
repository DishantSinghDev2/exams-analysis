-- Seed the database with sample data for testing

-- Insert sample admin users (replace with actual emails)
INSERT INTO admins (id, email, githubId, name, createdAt, updatedAt) VALUES
('admin1', 'shahdilipkumar909@gmail.com', '12345', 'Dishant Singh', NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Insert sample exam options
INSERT INTO exam_options (id, examDate, shift, subjectCombination, examName, isActive, createdAt, updatedAt) VALUES
-- NEET 2025
('eo1', '03/06/2025', '03 June Shift 1', 'Combination 1', 'NEET 2025', true, NOW(), NOW()),
('eo2', '03/06/2025', '03 June Shift 1', 'Combination 2', 'NEET 2025', true, NOW(), NOW()),
('eo3', '03/06/2025', '03 June Shift 2', 'Combination 1', 'NEET 2025', true, NOW(), NOW()),
('eo4', '03/06/2025', '03 June Shift 2', 'Combination 2', 'NEET 2025', true, NOW(), NOW()),

-- JEE Mains 2025
('eo5', '01/06/2025', '01 June Shift 1', 'Combination 1', 'JEE Mains 2025', true, NOW(), NOW()),
('eo6', '01/06/2025', '01 June Shift 2', 'Combination 1', 'JEE Mains 2025', true, NOW(), NOW()),
('eo7', '02/06/2025', '02 June Shift 1', 'Combination 1', 'JEE Mains 2025', true, NOW(), NOW()),
('eo8', '02/06/2025', '02 June Shift 2', 'Combination 1', 'JEE Mains 2025', true, NOW(), NOW()),

-- CUET 2025
('eo9', '15/05/2025', '15 May Shift 1', 'Combination 1', 'CUET 2025', true, NOW(), NOW()),
('eo10', '15/05/2025', '15 May Shift 1', 'Combination 2', 'CUET 2025', true, NOW(), NOW()),
('eo11', '15/05/2025', '15 May Shift 2', 'Combination 1', 'CUET 2025', true, NOW(), NOW()),
('eo12', '15/05/2025', '15 May Shift 2', 'Combination 2', 'CUET 2025', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Insert sample marking schemes
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
('ms10', '15/05/2025', '15 May Shift 1', 'Combination 1', 'Biology', 5, -1, 0, 50, 250),
('ms11', '15/05/2025', '15 May Shift 1', 'Combination 1', 'Chemistry', 5, -1, 0, 50, 250),
('ms12', '15/05/2025', '15 May Shift 1', 'Combination 2', 'Biology', 5, -1, 0, 50, 250),
('ms13', '15/05/2025', '15 May Shift 1', 'Combination 2', 'Chemistry', 5, -1, 0, 50, 250),
('ms14', '15/05/2025', '15 May Shift 2', 'Combination 1', 'Biology', 5, -1, 0, 50, 250),
('ms15', '15/05/2025', '15 May Shift 2', 'Combination 1', 'Chemistry', 5, -1, 0, 50, 250),
('ms16', '15/05/2025', '15 May Shift 2', 'Combination 2', 'Biology', 5, -1, 0, 50, 250),
('ms17', '15/05/2025', '15 May Shift 2', 'Combination 2', 'Chemistry', 5, -1, 0, 50, 250)
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Insert sample answer keys
INSERT INTO answer_keys (id, examDate, shift, subjectCombination, subject, answers, isApproved, submittedBy, createdAt, updatedAt) VALUES
('ak1', '03/06/2025', '03 June Shift 2', 'Combination 2', 'Biology', 
'[{"questionId":"226895708462","correctOptions":["3"],"optionIds":["2268952746936"]},{"questionId":"226895708452","correctOptions":["4"],"optionIds":["2268952746897"]}]', 
true, 'admin', NOW(), NOW())
ON DUPLICATE KEY UPDATE updatedAt = NOW();
