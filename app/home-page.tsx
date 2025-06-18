"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, FileText, BarChart3, Calendar, Clock, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { parsePDFResponse } from "@/lib/pdf-parser"
import type { AnalysisResult } from "@/types"

interface ExamOption {
  examDate: string
  examName: string
  shifts: Array<{
    shift: string
    subjectCombinations: string[]
  }>
}

export default function HomePage() {
  const [examOptions, setExamOptions] = useState<ExamOption[]>([])
  const [selectedExamDate, setSelectedExamDate] = useState("")
  const [selectedShift, setSelectedShift] = useState("")
  const [selectedSubjectCombination, setSelectedSubjectCombination] = useState("")
  const [responseInput, setResponseInput] = useState("")
  const [inputType, setInputType] = useState<"url" | "paste" | "file">("url")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showAnswerKeyForm, setShowAnswerKeyForm] = useState(false)
  const [answerKeyInput, setAnswerKeyInput] = useState("")
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Get available shifts for selected exam date
  const availableShifts = selectedExamDate
    ? examOptions.find((option) => option.examDate === selectedExamDate)?.shifts || []
    : []

  // Get available subject combinations for selected shift
  const availableSubjectCombinations = selectedShift
    ? availableShifts.find((shift) => shift.shift === selectedShift)?.subjectCombinations || []
    : []

  useEffect(() => {
    fetchExamOptions()
  }, [])

  // Reset dependent selections when parent selection changes
  useEffect(() => {
    setSelectedShift("")
    setSelectedSubjectCombination("")
  }, [selectedExamDate])

  useEffect(() => {
    setSelectedSubjectCombination("")
  }, [selectedShift])

  const fetchExamOptions = async () => {
    try {
      const response = await fetch("/api/exam-options")
      const data = await response.json()

      if (data.success) {
        setExamOptions(data.examOptions)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Failed to Load Options",
        description: "Could not fetch available exam options",
        variant: "destructive",
      })
    } finally {
      setIsLoadingOptions(false)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedExamDate || !selectedShift || !selectedSubjectCombination) {
      toast({
        title: "Missing Information",
        description: "Please select exam date, shift, and subject combination",
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
          examDate: selectedExamDate,
          shift: selectedShift,
          subjectCombination: selectedSubjectCombination,
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
          examDate: selectedExamDate,
          shift: selectedShift,
          subjectCombination: selectedSubjectCombination,
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

  if (isLoadingOptions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading exam options...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (examOptions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-800">No Exams Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              No exam options are currently available. Please check back later or contact the administrator.
            </p>
            <Button onClick={fetchExamOptions} variant="outline">
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
                  <Label htmlFor="examDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Exam Date
                  </Label>
                  <Select value={selectedExamDate} onValueChange={setSelectedExamDate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam date" />
                    </SelectTrigger>
                    <SelectContent>
                      {examOptions.map((option) => (
                        <SelectItem key={option.examDate} value={option.examDate}>
                          {option.examName} - {option.examDate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="shift" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Shift
                  </Label>
                  <Select value={selectedShift} onValueChange={setSelectedShift} disabled={!selectedExamDate}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedExamDate ? "Select shift" : "Select exam date first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableShifts.map((shift) => (
                        <SelectItem key={shift.shift} value={shift.shift}>
                          {shift.shift}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subjectCombination">Subject Combination</Label>
                  <Select
                    value={selectedSubjectCombination}
                    onValueChange={setSelectedSubjectCombination}
                    disabled={!selectedShift}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedShift ? "Select combination" : "Select shift first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjectCombinations.map((combination) => (
                        <SelectItem key={combination} value={combination}>
                          {combination}
                        </SelectItem>
                      ))}
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Selected Exam Details:</h4>
                <div className="text-sm text-blue-700">
                  <p>
                    <strong>Date:</strong> {selectedExamDate}
                  </p>
                  <p>
                    <strong>Shift:</strong> {selectedShift}
                  </p>
                  <p>
                    <strong>Subject Combination:</strong> {selectedSubjectCombination}
                  </p>
                </div>
              </div>
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
                  setSelectedExamDate("")
                  setSelectedShift("")
                  setSelectedSubjectCombination("")
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
