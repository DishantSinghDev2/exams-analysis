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
CREATE TABLE `exams` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `year` VARCHAR(10) NOT NULL,
    `description` VARCHAR(500) NULL,
    `hasSubjectCombinations` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `exams_isActive_idx`(`isActive`),
    UNIQUE INDEX `exams_name_year_key`(`name`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_dates` (
    `id` VARCHAR(191) NOT NULL,
    `examId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `exam_dates_examId_idx`(`examId`),
    INDEX `exam_dates_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_shifts` (
    `id` VARCHAR(191) NOT NULL,
    `examDateId` VARCHAR(191) NOT NULL,
    `shiftName` VARCHAR(100) NOT NULL,
    `startTime` VARCHAR(20) NULL,
    `endTime` VARCHAR(20) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `exam_shifts_examDateId_idx`(`examDateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_combinations` (
    `id` VARCHAR(191) NOT NULL,
    `examShiftId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `subjects` JSON NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `subject_combinations_examShiftId_idx`(`examShiftId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_keys` (
    `id` VARCHAR(191) NOT NULL,
    `examName` VARCHAR(100) NOT NULL,
    `examYear` VARCHAR(10) NOT NULL,
    `examDate` DATETIME(3) NOT NULL,
    `shiftName` VARCHAR(100) NOT NULL,
    `subjectCombination` VARCHAR(100) NULL,
    `subject` VARCHAR(100) NOT NULL,
    `answers` JSON NOT NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `submittedBy` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `answer_keys_examName_examYear_examDate_shiftName_idx`(`examName`, `examYear`, `examDate`, `shiftName`),
    INDEX `answer_keys_isApproved_idx`(`isApproved`),
    UNIQUE INDEX `answer_keys_examName_examYear_examDate_shiftName_subjectComb_key`(`examName`, `examYear`, `examDate`, `shiftName`, `subjectCombination`, `subject`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marking_schemes` (
    `id` VARCHAR(191) NOT NULL,
    `examName` VARCHAR(100) NOT NULL,
    `examYear` VARCHAR(10) NOT NULL,
    `examDate` DATETIME(3) NOT NULL,
    `shiftName` VARCHAR(100) NOT NULL,
    `subjectCombination` VARCHAR(100) NULL,
    `subject` VARCHAR(100) NOT NULL,
    `correctMarks` INTEGER NOT NULL DEFAULT 4,
    `incorrectMarks` INTEGER NOT NULL DEFAULT -1,
    `unattemptedMarks` INTEGER NOT NULL DEFAULT 0,
    `totalQuestions` INTEGER NOT NULL DEFAULT 50,
    `totalMarks` INTEGER NOT NULL DEFAULT 200,

    INDEX `marking_schemes_examName_examYear_examDate_shiftName_idx`(`examName`, `examYear`, `examDate`, `shiftName`),
    UNIQUE INDEX `marking_schemes_examName_examYear_examDate_shiftName_subject_key`(`examName`, `examYear`, `examDate`, `shiftName`, `subjectCombination`, `subject`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_responses` (
    `id` VARCHAR(191) NOT NULL,
    `examName` VARCHAR(100) NOT NULL,
    `examYear` VARCHAR(10) NOT NULL,
    `examDate` DATETIME(3) NOT NULL,
    `shiftName` VARCHAR(100) NOT NULL,
    `subjectCombination` VARCHAR(100) NULL,
    `applicationNo` VARCHAR(50) NULL,
    `candidateName` VARCHAR(200) NULL,
    `rollNo` VARCHAR(50) NULL,
    `responses` JSON NOT NULL,
    `analysisResult` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `student_responses_examName_examYear_examDate_shiftName_idx`(`examName`, `examYear`, `examDate`, `shiftName`),
    INDEX `student_responses_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pending_answer_keys` (
    `id` VARCHAR(191) NOT NULL,
    `examName` VARCHAR(100) NOT NULL,
    `examYear` VARCHAR(10) NOT NULL,
    `examDate` DATETIME(3) NOT NULL,
    `shiftName` VARCHAR(100) NOT NULL,
    `subjectCombination` VARCHAR(100) NULL,
    `subject` VARCHAR(100) NOT NULL,
    `answerKeyData` TEXT NOT NULL,
    `submittedBy` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pending_answer_keys_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exam_dates` ADD CONSTRAINT `exam_dates_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_shifts` ADD CONSTRAINT `exam_shifts_examDateId_fkey` FOREIGN KEY (`examDateId`) REFERENCES `exam_dates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject_combinations` ADD CONSTRAINT `subject_combinations_examShiftId_fkey` FOREIGN KEY (`examShiftId`) REFERENCES `exam_shifts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
