export interface ExamResponse {
  questionId: string
  chosenOption: string
  status: "Answered" | "Not Answered"
  subject: string
}

export interface ParsedResponseData {
  applicationNo: string
  candidateName: string
  rollNo: string
  testDate: string
  testTime: string
  subject: string
  responses: ExamResponse[]
}

export interface AnswerKeyEntry {
  sno: string
  subject: string
  questionId: string
  correctOptions: string[]
  optionIds: string[]
}

export interface SubjectScore {
  correct: number
  incorrect: number
  unattempted: number
  score: number
  totalQuestions: number
  maxScore: number
}

export interface DetailedComparison {
  questionId: string
  subject: string
  studentAnswer: string
  correctAnswer: string[]
  status: "Correct" | "Incorrect" | "Unattempted"
  marksAwarded: number
}

export interface AnalysisResult {
  subjectWiseScores: Record<string, SubjectScore>
  totalScore: number
  maxTotalScore: number
  detailedComparison: DetailedComparison[]
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  exam: string
  subject: string
  shift?: string
  author?: string
}

export interface PendingAnswerKey {
  id: string
  examDate: string
  shift: string
  subjectCombination: string
  subject: string
  answerKeyData: string
  submittedBy: string
  createdAt: string
}

export interface MarkingScheme {
  id: string
  examDate: string
  shift: string
  subjectCombination: string
  subject: string
  correctMarks: number
  incorrectMarks: number
  unattemptedMarks: number
  totalQuestions: number
  totalMarks: number
}
