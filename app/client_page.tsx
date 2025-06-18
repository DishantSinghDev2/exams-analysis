"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, FileText, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { parsePDFResponse } from "@/lib/pdf-parser"

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

export default function HomePage() {
  const [examDate, setExamDate] = useState("")
  const [shift, setShift] = useState("")
  const [subjectCombination, setSubjectCombination] = useState("")
  const [responseInput, setResponseInput] = useState("")
  const [inputType, setInputType] = useState<"url" | "paste" | "file">("url")
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showAnswerKeyForm, setShowAnswerKeyForm] = useState(false)
  const [answerKeyInput, setAnswerKeyInput] = useState("")
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleAnalyze = async () => {
    if (!examDate || !shift || !subjectCombination) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (inputType === "file" && !selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF file to upload",
        variant: "destructive",
      })
      return
    }

    if (inputType !== "file" && !responseInput) {
      toast({
        title: "Missing Input",
        description: "Please provide response sheet URL or content",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      let finalInput = responseInput

      if (inputType === "file" && selectedFile) {
        const parsedData = await parsePDFResponse(selectedFile)
        finalInput = JSON.stringify(parsedData)
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate,
          shift,
          subjectCombination,
          responseInput: finalInput,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.analysis) {
          setAnalysisResult(data.analysis)
        } else {
          setShowAnswerKeyForm(true)
          toast({
            title: "Answer Key Not Available",
            description: "Please provide the answer key for approval",
            variant: "default",
          })
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAnswerKey = async () => {
    if (!answerKeyInput) {
      toast({
        title: "Missing Answer Key",
        description: "Please provide the answer key data",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/submit-answer-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate,
          shift,
          subjectCombination,
          answerKeyData: answerKeyInput,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Answer Key Submitted",
          description: "Your answer key has been submitted for admin approval",
          variant: "default",
        })
        setShowAnswerKeyForm(false)
        setAnswerKeyInput("")
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Exam Response Analyzer</h1>
          <p className="text-lg text-gray-600">Upload your response sheet and get detailed subject-wise analysis</p>
        </div>

        {!analysisResult && !showAnswerKeyForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Response Sheet Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input
                    id="examDate"
                    placeholder="e.g., 03/06/2025"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="shift">Shift</Label>
                  <Input
                    id="shift"
                    placeholder="e.g., 03 June Shift 2"
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="subjectCombination">Subject Combination</Label>
                  <Select value={subjectCombination} onValueChange={setSubjectCombination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select combination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Combination 1">Combination 1</SelectItem>
                      <SelectItem value="Combination 2">Combination 2</SelectItem>
                      <SelectItem value="Combination 3">Combination 3</SelectItem>
                      <SelectItem value="Combination 4">Combination 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={inputType} onValueChange={(value) => setInputType(value as "url" | "paste" | "file")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="paste" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Paste
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Upload PDF
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-2">
                  <Label htmlFor="responseUrl">Response Sheet URL</Label>
                  <Input
                    id="responseUrl"
                    placeholder="https://cdn3.digialm.com/..."
                    value={responseInput}
                    onChange={(e) => setResponseInput(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">Paste the direct link to your Digialm response sheet</p>
                </TabsContent>
                <TabsContent value="paste" className="space-y-2">
                  <Label htmlFor="responseContent">Response Sheet Content</Label>
                  <Textarea
                    id="responseContent"
                    placeholder="Paste your response sheet HTML content here..."
                    value={responseInput}
                    onChange={(e) => setResponseInput(e.target.value)}
                    rows={8}
                  />
                  <p className="text-sm text-gray-500">
                    Copy and paste the entire HTML content from your response sheet
                  </p>
                </TabsContent>
                <TabsContent value="file" className="space-y-2">
                  <Label htmlFor="responseFile">Upload PDF Response Sheet</Label>
                  <Input
                    id="responseFile"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-500">Upload your PDF response sheet file</p>
                </TabsContent>
              </Tabs>

              <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? "Analyzing..." : "Analyze Response Sheet"}
              </Button>
            </CardContent>
          </Card>
        )}

        {showAnswerKeyForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit Answer Key for Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="answerKey">Answer Key Data</Label>
                <Textarea
                  id="answerKey"
                  placeholder="Sno | Subject | QuestionID | Correct Option(s) | Option ID(s) Claimed&#10;1 | Biology | 226895708462 | 3 | 2268952746936&#10;2 | Biology | 226895708452 | 4 | 2268952746897"
                  value={answerKeyInput}
                  onChange={(e) => setAnswerKeyInput(e.target.value)}
                  rows={10}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Format: Sno | Subject | QuestionID | Correct Option(s) | Option ID(s) Claimed
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmitAnswerKey} className="flex-1">
                  Submit for Approval
                </Button>
                <Button variant="outline" onClick={() => setShowAnswerKeyForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {analysisResult && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{analysisResult.totalScore}</div>
                    <div className="text-sm text-gray-600">Total Score (out of {analysisResult.maxTotalScore})</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {((analysisResult.totalScore / analysisResult.maxTotalScore) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Percentage Score</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Subject-wise Performance</h3>
                  {Object.entries(analysisResult.subjectWiseScores).map(([subject, scores]) => (
                    <div key={subject} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{subject}</h4>
                        <span className="text-lg font-bold">
                          {scores.score}/{scores.maxScore}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-600">{scores.correct}</div>
                          <div className="text-gray-600">Correct</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="font-bold text-red-600">{scores.incorrect}</div>
                          <div className="text-gray-600">Incorrect</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-bold text-gray-600">{scores.unattempted}</div>
                          <div className="text-gray-600">Unattempted</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Question Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Question ID</th>
                        <th className="border border-gray-300 p-2 text-left">Subject</th>
                        <th className="border border-gray-300 p-2 text-left">Your Answer</th>
                        <th className="border border-gray-300 p-2 text-left">Correct Answer</th>
                        <th className="border border-gray-300 p-2 text-left">Status</th>
                        <th className="border border-gray-300 p-2 text-left">Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResult.detailedComparison.map((item, index) => (
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
                          <td className="border border-gray-300 p-2">{item.questionId}</td>
                          <td className="border border-gray-300 p-2">{item.subject}</td>
                          <td className="border border-gray-300 p-2">{item.studentAnswer}</td>
                          <td className="border border-gray-300 p-2">{item.correctAnswer.join(", ")}</td>
                          <td className="border border-gray-300 p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                item.status === "Correct"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "Incorrect"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.status === "Correct" ? "✅" : item.status === "Incorrect" ? "❌" : "⚪"}{" "}
                              {item.status}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2 font-medium">
                            {item.marksAwarded > 0 ? "+" : ""}
                            {item.marksAwarded}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={() => {
                  setAnalysisResult(null)
                  setExamDate("")
                  setShift("")
                  setSubjectCombination("")
                  setResponseInput("")
                }}
                variant="outline"
              >
                Analyze Another Response Sheet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
