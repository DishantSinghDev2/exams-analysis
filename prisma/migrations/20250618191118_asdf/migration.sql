/*
  Warnings:

  - A unique constraint covering the columns `[examName,examYear,examDate,shiftName,subjectCombination,subject]` on the table `answer_keys` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[examName,examYear,examDate,shiftName,subjectCombination,subject]` on the table `marking_schemes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `answer_keys_examName_examYear_examDate_shiftName_subjectComb_key` ON `answer_keys`(`examName`, `examYear`, `examDate`, `shiftName`, `subjectCombination`, `subject`);

-- CreateIndex
CREATE UNIQUE INDEX `marking_schemes_examName_examYear_examDate_shiftName_subject_key` ON `marking_schemes`(`examName`, `examYear`, `examDate`, `shiftName`, `subjectCombination`, `subject`);
