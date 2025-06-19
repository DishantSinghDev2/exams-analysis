import { prisma } from "./prisma"
import { type AnalysisResult } from "@/types"

export async function analyzeResponse(
  examName: string,
  examYear: string,
  examDate: Date,
  shiftName: string,
  subjectCombination: string | null,
  responses: Array<{
    questionId: string
    chosenOption: string
    status: string
    subject: string
    imageUrl?: string
  }>,
): Promise<AnalysisResult | null> {
  // Get answer keys for all subjects
  const answerKeys = await prisma.answerKey.findMany({
    where: {
      examName,
      examYear,
      examDate,
      shiftName,
      subjectCombination,
      isApproved: true,
    },
  })

  if (answerKeys.length === 0) {
    return null
  }

  // Get marking schemes
  const markingSchemes = await prisma.markingScheme.findMany({
    where: {
      examName,
      examYear,
      examDate,
      shiftName,
      subjectCombination,
    },
  })

  const subjectWiseScores: Record<string, any> = {}
  const detailedComparison: any[] = []
  let totalScore = 0
  let maxTotalScore = 0
  let totalQuestions = 0
  let attemptedQuestions = 0
  let correctAnswers = 0
  let incorrectAnswers = 0
  let unansweredQuestions = 0

  // Get unique subjects
  const subjects = Array.from(new Set(responses.map((r) => r.subject)))
  const hasMultipleSubjects = subjects.length > 1

  // Process each subject
  for (const answerKey of answerKeys) {
    const subject = answerKey.subject
    const answers = answerKey.answers as Array<{
      questionId: string
      correctAnswerId: string
    }>

    const markingScheme = markingSchemes.find((ms) => ms.subject === subject) || {
      correctMarks: 4,
      incorrectMarks: -1,
      unattemptedMarks: 0,
      totalQuestions: 50,
      totalMarks: 200,
    }

    let correct = 0
    let incorrect = 0
    let unattempted = 0
    let attempted = 0
    let subjectScore = 0

    // Create answer map for quick lookup
    const answerMap = new Map()
    answers.forEach((ans) => {
      answerMap.set(ans.questionId, ans.correctAnswerId)
    })

    // Analyze each response for this subject
    const subjectResponses = responses.filter((r) => r.subject === subject)
    totalQuestions += subjectResponses.length

    for (const response of subjectResponses) {
      const correctAnswerId = answerMap.get(response.questionId);
      let status: "Correct" | "Incorrect" | "Unattempted" | "Marked For Review" | "Not Attempted and Marked For Review" = "Unattempted";
      let marksAwarded = markingScheme.unattemptedMarks;

      if ((response.status === "Answered" || response.status === "Marked For Review") && response.chosenOption) {
        attempted++;
        attemptedQuestions++;
        if (correctAnswerId && response.chosenOption === correctAnswerId) {
          status = "Correct";
          marksAwarded = markingScheme.correctMarks;
          correct++;
          correctAnswers++;
        } else {
          status = "Incorrect";
          marksAwarded = markingScheme.incorrectMarks;
          incorrect++;
          incorrectAnswers++;
        }
      } else if (response.status === "Not Attempted and Marked For Review") {
        status = "Not Attempted and Marked For Review";
        unattempted++;
        unansweredQuestions++;
      } else {
        unattempted++;
        unansweredQuestions++;
      }

      subjectScore += marksAwarded;

      detailedComparison.push({
        questionId: response.questionId,
        subject: subject,
        studentAnswer: response.chosenOption || "Not Attempted",
        correctAnswer: [correctAnswerId || "Unknown"],
        status,
        marksAwarded,
        imageUrl: response.imageUrl || "",
      });
    }

    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0

    subjectWiseScores[subject] = {
      correct,
      incorrect,
      unattempted,
      attempted,
      score: subjectScore,
      totalQuestions: subjectResponses.length,
      maxScore: subjectResponses.length * markingScheme.correctMarks,
      accuracy: Math.round(accuracy * 100) / 100,
    }

    totalScore += subjectScore
    maxTotalScore += subjectResponses.length * markingScheme.correctMarks
  }

  const overallAccuracy = attemptedQuestions > 0 ? (correctAnswers / attemptedQuestions) * 100 : 0
  const completionRate = totalQuestions > 0 ? (attemptedQuestions / totalQuestions) * 100 : 0

  return {
    subjectWiseScores,
    totalScore,
    maxTotalScore,
    totalQuestions,
    attemptedQuestions,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    accuracy: Math.round(overallAccuracy * 100) / 100,
    completionRate: Math.round(completionRate * 100) / 100,
    hasMultipleSubjects,
    detailedComparison,
  }
}
