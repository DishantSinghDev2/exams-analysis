"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BarChart3, Target, TrendingUp, Award, CheckCircle, XCircle, Clock, BookOpen, Eye } from "lucide-react"
import QuestionImageViewer from "./question-image-viewer"

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
      attempted: number
      accuracy: number
    }
  >
  totalScore: number
  maxTotalScore: number
  totalQuestions: number
  attemptedQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  unansweredQuestions: number
  accuracy: number
  completionRate: number
  hasMultipleSubjects: boolean
  detailedComparison: Array<{
    questionId: string
    subject: string
    studentAnswer: string
    correctAnswer: string[]
    status: "Correct" | "Incorrect" | "Unattempted"
    marksAwarded: number
    imageUrl?: string
    questionNumber?: string
  }>
}

interface AnalysisResultsProps {
  result: AnalysisResult
  onReset: () => void
}

export default function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)

  const percentage = result.maxTotalScore > 0 ? (result.totalScore / result.maxTotalScore) * 100 : 0

  const handleViewQuestion = (question: any, index: number) => {
    setSelectedQuestion({
      questionId: question.questionId,
      questionNumber: `${index + 1}`,
      imageUrl: question.imageUrl || `/placeholder.svg?height=400&width=600&text=Question+${index + 1}`,
      selectedOption: question.studentAnswer,
      correctOption: question.correctAnswer.join(", "),
      status: question.status,
      subject: question.subject,
    })
    setIsImageViewerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Score</p>
                <p className="text-3xl font-bold text-blue-900">
                  {result.totalScore}/{result.maxTotalScore}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-200 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Overall Percentage</p>
                <p className="text-3xl font-bold text-green-900">{percentage.toFixed(2)}%</p>
              </div>
              <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{result.attemptedQuestions}</div>
              <div className="text-sm text-gray-600">Attempted</div>
              <div className="text-xs text-gray-500">
                {result.attemptedQuestions}/{result.totalQuestions}
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{result.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct</div>
              <div className="text-xs text-gray-500">
                {result.correctAnswers}/{result.attemptedQuestions}
              </div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{result.incorrectAnswers}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
              <div className="text-xs text-gray-500">
                {result.incorrectAnswers}/{result.attemptedQuestions}
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-600">{result.unansweredQuestions}</div>
              <div className="text-sm text-gray-600">Skipped</div>
              <div className="text-xs text-gray-500">
                {result.unansweredQuestions}/{result.totalQuestions}
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{result.completionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{result.accuracy.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Progress - Only show for multi-subject exams */}
      {result.hasMultipleSubjects && Object.keys(result.subjectWiseScores).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(result.subjectWiseScores).map(([subject, scores]) => {
                const subjectPercentage = scores.maxScore > 0 ? (scores.score / scores.maxScore) * 100 : 0
                return (
                  <div key={subject} className="bg-white border rounded-lg p-6">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-lg mb-1">{subject}</h3>
                      <p className="text-sm text-gray-500">Out of {scores.maxScore}</p>
                    </div>

                    {/* Circular Progress */}
                    <div className="flex justify-center mb-4">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#3b82f6"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - subjectPercentage / 100)}`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-blue-600">{Math.round(subjectPercentage)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subject Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Attempted</span>
                        <span className="font-medium">
                          {scores.attempted}/{scores.totalQuestions}
                        </span>
                      </div>
                      <Progress value={(scores.attempted / scores.totalQuestions) * 100} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Correct</span>
                        <span className="font-medium text-green-600">
                          {scores.correct}/{scores.attempted}
                        </span>
                      </div>
                      <Progress
                        value={scores.attempted > 0 ? (scores.correct / scores.attempted) * 100 : 0}
                        className="h-2"
                      />

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Incorrect</span>
                        <span className="font-medium text-red-600">
                          {scores.incorrect}/{scores.attempted}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium text-gray-700">Accuracy</span>
                        <span className="font-bold text-blue-600">{scores.accuracy.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Question Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Question Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">Q.No</th>
                  <th className="border border-gray-300 p-2 text-left">Question ID</th>
                  {result.hasMultipleSubjects && <th className="border border-gray-300 p-2 text-left">Subject</th>}
                  <th className="border border-gray-300 p-2 text-left">Your Answer</th>
                  <th className="border border-gray-300 p-2 text-left">Correct Answer</th>
                  <th className="border border-gray-300 p-2 text-left">Status</th>
                  <th className="border border-gray-300 p-2 text-left">Marks</th>
                  <th className="border border-gray-300 p-2 text-left">View</th>
                </tr>
              </thead>
              <tbody>
                {result.detailedComparison.map((item, index) => (
                  <tr
                    key={index}
                    className={
                      item.status === "Correct"
                        ? "bg-green-50"
                        : item.status === "Incorrect"
                          ? "bg-red-50"
                          : "bg-gray-50"
                    }
                  >
                    <td className="border border-gray-300 p-2 font-medium">{index + 1}</td>
                    <td className="border border-gray-300 p-2 font-mono text-sm">{item.questionId}</td>
                    {result.hasMultipleSubjects && (
                      <td className="border border-gray-300 p-2">
                        <Badge variant="outline">{item.subject}</Badge>
                      </td>
                    )}
                    <td className="border border-gray-300 p-2">{item.studentAnswer}</td>
                    <td className="border border-gray-300 p-2">{item.correctAnswer.join(", ")}</td>
                    <td className="border border-gray-300 p-2">
                      <Badge
                        variant={
                          item.status === "Correct"
                            ? "default"
                            : item.status === "Incorrect"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {item.status === "Correct" ? "✅" : item.status === "Incorrect" ? "❌" : "⚪"} {item.status}
                      </Badge>
                    </td>
                    <td className="border border-gray-300 p-2 font-medium">
                      <span
                        className={
                          item.marksAwarded > 0
                            ? "text-green-600"
                            : item.marksAwarded < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        }
                      >
                        {item.marksAwarded > 0 ? "+" : ""}
                        {item.marksAwarded}
                      </span>
                    </td>
                    <td className="border border-gray-300 p-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewQuestion(item, index)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Analyze Another Response Sheet
        </button>
      </div>

      {/* Question Image Viewer */}
      {selectedQuestion && (
        <QuestionImageViewer
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          questionData={selectedQuestion}
        />
      )}
    </div>
  )
}
