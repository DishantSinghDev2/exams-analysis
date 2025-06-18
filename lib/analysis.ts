import { prisma } from "./prisma"

interface AnalysisResult {
  subjectWiseScores: Record<
    string,
    {
      correct: number
      incorrect: number
      unattempted: number
      score: number
      totalQuestions: number
      maxScore: number
    }
  >
  totalScore: number
  maxTotalScore: number
  detailedComparison: Array<{
    questionId: string
    subject: string
    studentAnswer: string
    correctAnswer: string[]
    status: "Correct" | "Incorrect" | "Unattempted"
    marksAwarded: number
  }>
}

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

  // Process each subject
  for (const answerKey of answerKeys) {
    const subject = answerKey.subject
    const answers = answerKey.answers as Array<{
      questionId: string
      correctOptions: string[]
      optionIds: string[]
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
    let subjectScore = 0

    // Create answer map for quick lookup
    const answerMap = new Map()
    answers.forEach((ans) => {
      answerMap.set(ans.questionId, ans.correctOptions)
    })

    // Analyze each response for this subject
    const subjectResponses = responses.filter((r) => r.subject === subject)

    for (const response of subjectResponses) {
      const correctOptions = answerMap.get(response.questionId) || []
      let status: "Correct" | "Incorrect" | "Unattempted" = "Unattempted"
      let marksAwarded = markingScheme.unattemptedMarks

      if (response.status === "Answered" && response.chosenOption) {
        if (correctOptions.includes(response.chosenOption)) {
          status = "Correct"
          marksAwarded = markingScheme.correctMarks
          correct++
        } else {
          status = "Incorrect"
          marksAwarded = markingScheme.incorrectMarks
          incorrect++
        }
      } else {
        unattempted++
      }

      subjectScore += marksAwarded

      detailedComparison.push({
        questionId: response.questionId,
        subject: subject,
        studentAnswer: response.chosenOption || "Not Attempted",
        correctAnswer: correctOptions,
        status,
        marksAwarded,
      })
    }

    subjectWiseScores[subject] = {
      correct,
      incorrect,
      unattempted,
      score: subjectScore,
      totalQuestions: subjectResponses.length,
      maxScore: subjectResponses.length * markingScheme.correctMarks,
    }

    totalScore += subjectScore
    maxTotalScore += subjectResponses.length * markingScheme.correctMarks
  }

  return {
    subjectWiseScores,
    totalScore,
    maxTotalScore,
    detailedComparison,
  }
}
