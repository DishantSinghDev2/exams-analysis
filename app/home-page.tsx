"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Upload, Link, FileText, Calendar, Clock, BookOpen, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { parsePDFResponse } from "@/lib/pdf-parser"
import type { AnalysisResult } from "@/types"
import AnalysisResults from "@/components/analysis-results"

interface ExamData {
  id: string
  name: string
  year: string
  description?: string
  hasSubjectCombinations: boolean
  displayName: string
  dates: Array<{
    id: string
    date: string
    formattedDate: string
    shifts: Array<{
      id: string
      name: string
      startTime?: string
      endTime?: string
      combinations: Array<{
        id: string
        name: string
        subjects: string[]
      }>
    }>
  }>
}

export default function HomePage() {
  const [exams, setExams] = useState<ExamData[]>([])
  const [selectedExam, setSelectedExam] = useState<ExamData | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedShift, setSelectedShift] = useState("")
  const [selectedCombination, setSelectedCombination] = useState("")
  const [responseInput, setResponseInput] = useState("")
  const [inputType, setInputType] = useState<"url" | "paste" | "file">("url")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showAnswerKeyForm, setShowAnswerKeyForm] = useState(false)
  const [answerKeyInput, setAnswerKeyInput] = useState("")
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Get available dates for selected exam
  const availableDates = selectedExam?.dates || []

  // Get available shifts for selected date
  const availableShifts = selectedDate ? availableDates.find((date) => date.id === selectedDate)?.shifts || [] : []

  // Get available combinations for selected shift
  const availableCombinations = selectedShift
    ? availableShifts.find((shift) => shift.id === selectedShift)?.combinations || []
    : []

  // Check if current exam has subject combinations
  const hasSubjectCombinations = selectedExam?.hasSubjectCombinations || false

  useEffect(() => {
    fetchExams()
  }, [])

  // Reset dependent selections when parent selection changes
  useEffect(() => {
    setSelectedDate("")
    setSelectedShift("")
    setSelectedCombination("")
  }, [selectedExam])

  useEffect(() => {
    setSelectedShift("")
    setSelectedCombination("")
  }, [selectedDate])

  useEffect(() => {
    setSelectedCombination("")
  }, [selectedShift])

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams")
      const data = await response.json()

      if (data.success) {
        setExams(data.exams)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Failed to Load Exams",
        description: "Could not fetch available exams",
        variant: "destructive",
      })
    } finally {
      setIsLoadingExams(false)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedExam || !selectedDate || !selectedShift) {
      toast({
        title: "Missing Information",
        description: "Please select exam, date, and shift",
        variant: "destructive",
      })
      return
    }

    if (hasSubjectCombinations && !selectedCombination) {
      toast({
        title: "Missing Subject Combination",
        description: "Please select a subject combination for this exam",
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

      const selectedDateObj = availableDates.find((d) => d.id === selectedDate)
      const selectedShiftObj = availableShifts.find((s) => s.id === selectedShift)
      const selectedCombinationObj = availableCombinations.find((c) => c.id === selectedCombination)

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examName: selectedExam.name,
          examYear: selectedExam.year,
          examDate: selectedDateObj?.date,
          shiftName: selectedShiftObj?.name,
          subjectCombination: selectedCombinationObj?.name || null,
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
      const selectedDateObj = availableDates.find((d) => d.id === selectedDate)
      const selectedShiftObj = availableShifts.find((s) => s.id === selectedShift)
      const selectedCombinationObj = availableCombinations.find((c) => c.id === selectedCombination)

      const response = await fetch("/api/submit-answer-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examName: selectedExam?.name,
          examYear: selectedExam?.year,
          examDate: selectedDateObj?.date,
          shiftName: selectedShiftObj?.name,
          subjectCombination: selectedCombinationObj?.name || null,
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

  if (isLoadingExams) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading available exams...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-xl text-gray-800">No Exams Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              No exams are currently configured. Please contact the administrator to add exam options.
            </p>
            <Button onClick={fetchExams} variant="outline">
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
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Exam Response Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">Comprehensive analysis tool for competitive exam response sheets</p>
          {selectedExam && (
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {selectedExam.displayName}
              </Badge>
              {selectedExam.description && <span className="text-sm text-gray-500">• {selectedExam.description}</span>}
            </div>
          )}
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
              {/* Exam Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="exam" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Select Exam
                  </Label>
                  <Select
                    value={selectedExam?.id || ""}
                    onValueChange={(value) => {
                      const exam = exams.find((e) => e.id === value)
                      setSelectedExam(exam || null)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{exam.displayName}</span>
                            {exam.description && <span className="text-xs text-gray-500">{exam.description}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Exam Date
                  </Label>
                  <Select value={selectedDate} onValueChange={setSelectedDate} disabled={!selectedExam}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedExam ? "Select date" : "Select exam first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDates.map((date) => (
                        <SelectItem key={date.id} value={date.id}>
                          {date.formattedDate}
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
                  <Select value={selectedShift} onValueChange={setSelectedShift} disabled={!selectedDate}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedDate ? "Select shift" : "Select date first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableShifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          <div className="flex flex-col">
                            <span>{shift.name}</span>
                            {shift.startTime && shift.endTime && (
                              <span className="text-xs text-gray-500">
                                {shift.startTime} - {shift.endTime}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasSubjectCombinations && (
                  <div>
                    <Label htmlFor="combination">Subject Combination</Label>
                    <Select
                      value={selectedCombination}
                      onValueChange={setSelectedCombination}
                      disabled={!selectedShift}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={selectedShift ? "Select combination" : "Select shift first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCombinations.map((combination) => (
                          <SelectItem key={combination.id} value={combination.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{combination.name}</span>
                              <span className="text-xs text-gray-500">{combination.subjects.join(", ")}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Selection Summary */}
              {selectedExam && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Selected Configuration:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Exam:</span>
                      <p className="text-blue-800">{selectedExam.displayName}</p>
                    </div>
                    {selectedDate && (
                      <div>
                        <span className="text-blue-600 font-medium">Date:</span>
                        <p className="text-blue-800">
                          {availableDates.find((d) => d.id === selectedDate)?.formattedDate}
                        </p>
                      </div>
                    )}
                    {selectedShift && (
                      <div>
                        <span className="text-blue-600 font-medium">Shift:</span>
                        <p className="text-blue-800">{availableShifts.find((s) => s.id === selectedShift)?.name}</p>
                      </div>
                    )}
                    {selectedCombination && (
                      <div>
                        <span className="text-blue-600 font-medium">Combination:</span>
                        <p className="text-blue-800">
                          {availableCombinations.find((c) => c.id === selectedCombination)?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Response Input Tabs */}
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
                  <p className="text-sm text-gray-500">Paste the direct link to your response sheet</p>
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
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    <strong>Exam:</strong> {selectedExam?.displayName}
                  </p>
                  <p>
                    <strong>Date:</strong> {availableDates.find((d) => d.id === selectedDate)?.formattedDate}
                  </p>
                  <p>
                    <strong>Shift:</strong> {availableShifts.find((s) => s.id === selectedShift)?.name}
                  </p>
                  {selectedCombination && (
                    <p>
                      <strong>Combination:</strong>{" "}
                      {availableCombinations.find((c) => c.id === selectedCombination)?.name}
                    </p>
                  )}
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
          <AnalysisResults
            result={analysisResult}
            onReset={() => {
              setAnalysisResult(null)
              setSelectedExam(null)
              setSelectedDate("")
              setSelectedShift("")
              setSelectedCombination("")
              setResponseInput("")
              setSelectedFile(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
