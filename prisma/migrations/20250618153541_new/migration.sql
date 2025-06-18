-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `githubId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_email_key`(`email`),
    UNIQUE INDEX `admins_githubId_key`(`githubId`),
    INDEX `admins_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_options` (
    `id` VARCHAR(191) NOT NULL,
    `examDate` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL,
    `subjectCombination` VARCHAR(191) NOT NULL,
    `examName` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `exam_options_isActive_idx`(`isActive`),
    INDEX `exam_options_examDate_idx`(`examDate`),
    UNIQUE INDEX `exam_options_examDate_shift_subjectCombination_key`(`examDate`, `shift`, `subjectCombination`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_keys` (
    `id` VARCHAR(191) NOT NULL,
    `examDate` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL,
    `subjectCombination` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `answers` JSON NOT NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `submittedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `answer_keys_examDate_shift_subjectCombination_idx`(`examDate`, `shift`, `subjectCombination`),
    INDEX `answer_keys_isApproved_idx`(`isApproved`),
    UNIQUE INDEX `answer_keys_examDate_shift_subjectCombination_subject_key`(`examDate`, `shift`, `subjectCombination`, `subject`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marking_schemes` (
    `id` VARCHAR(191) NOT NULL,
    `examDate` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL,
    `subjectCombination` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `correctMarks` INTEGER NOT NULL DEFAULT 5,
    `incorrectMarks` INTEGER NOT NULL DEFAULT -1,
    `unattemptedMarks` INTEGER NOT NULL DEFAULT 0,
    `totalQuestions` INTEGER NOT NULL DEFAULT 50,
    `totalMarks` INTEGER NOT NULL DEFAULT 250,

    INDEX `marking_schemes_examDate_shift_subjectCombination_idx`(`examDate`, `shift`, `subjectCombination`),
    UNIQUE INDEX `marking_schemes_examDate_shift_subjectCombination_subject_key`(`examDate`, `shift`, `subjectCombination`, `subject`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_responses` (
    `id` VARCHAR(191) NOT NULL,
    `examDate` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL,
    `subjectCombination` VARCHAR(191) NOT NULL,
    `applicationNo` VARCHAR(191) NULL,
    `candidateName` VARCHAR(191) NULL,
    `rollNo` VARCHAR(191) NULL,
    `responses` JSON NOT NULL,
    `analysisResult` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `student_responses_examDate_shift_subjectCombination_idx`(`examDate`, `shift`, `subjectCombination`),
    INDEX `student_responses_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pending_answer_keys` (
    `id` VARCHAR(191) NOT NULL,
    `examDate` VARCHAR(191) NOT NULL,
    `shift` VARCHAR(191) NOT NULL,
    `subjectCombination` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `answerKeyData` TEXT NOT NULL,
    `submittedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pending_answer_keys_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
