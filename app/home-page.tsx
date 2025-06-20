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
import { Upload, Link, FileText, Calendar, Clock, BookOpen, GraduationCap, Paperclip } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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

interface ExamHistory {
  inputType: "url" | "paste"
  responseInput: string
  selectedExam: ExamData | null
  selectedDate: string
  selectedShift: string
  selectedCombination: string
}

export default function HomePage() {
  const [exams, setExams] = useState<ExamData[]>([])
  const [selectedExam, setSelectedExam] = useState<ExamData | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedShift, setSelectedShift] = useState("")
  const [selectedCombination, setSelectedCombination] = useState("")
  const [responseInput, setResponseInput] = useState("")
  const [inputType, setInputType] = useState<"url" | "paste">("url")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingExams, setIsLoadingExams] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showAnswerKeyForm, setShowAnswerKeyForm] = useState(false)
  const [answerKeyInput, setAnswerKeyInput] = useState("")
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [history, setHistory] = useState<ExamHistory[] | []>([])
  const [message, setMessage] = useState<string | null>(null)

  // Check if the URL contains ?mode=with_sample and add to history
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("mode") === "with_sample") {
      const sampleHistoryEntry: ExamHistory = {
        inputType: "url",
        responseInput: "https://cdn3.digialm.com//per/g28/pub/2083/touchstone/AssessmentQPHTMLMode1//2083O25179/2083O25179S54D18779/1749100892434601/HR10004902_2083O25179S54D18779E1.html",
        selectedExam: {
          id: "cmc29ar880000urqgdmq44g8y",
          name: "CUET",
          year: "2025",
          description: "The Common University Entrance Test (CUET) is a standardized entrance examination administered by the National Testing Agency (NTA) for undergraduate (UG) admissions to participating central, state, and private universities in India",
          hasSubjectCombinations: true,
          displayName: "CUET 2025",
          dates: [
            {
              id: "cmc29ayvj0002urqgzn66siow",
              date: "2025-06-03T00:00:00.000Z",
              formattedDate: "3rd June 2025",
              shifts: [
                {
                  id: "cmc29bi6h0004urqggjomimrs",
                  name: "Shift 2, Afternoon",
                  startTime: undefined,
                  endTime: undefined,
                  combinations: [
                    {
                      id: "cmc29d66z0006urqg9wbhgfzh",
                      name: "Combination 2",
                      subjects: ["Biology"],
                    },
                  ],
                },
              ],
            },
          ],
        },
        selectedDate: "cmc29ayvj0002urqgzn66siow",
        selectedShift: "cmc29bi6h0004urqggjomimrs",
        selectedCombination: "cmc29d66z0006urqg9wbhgfzh",
      };

      setHistory((prev) => {
        const isDuplicate = prev.some(
          (entry) =>
            entry.inputType === sampleHistoryEntry.inputType &&
            entry.responseInput === sampleHistoryEntry.responseInput &&
            entry.selectedExam?.id === sampleHistoryEntry.selectedExam?.id &&
            entry.selectedDate === sampleHistoryEntry.selectedDate &&
            entry.selectedShift === sampleHistoryEntry.selectedShift &&
            entry.selectedCombination === sampleHistoryEntry.selectedCombination
        );
        return isDuplicate ? prev : [...prev, sampleHistoryEntry];
      });

      setMessage("Sample exam history added. You can now analyze the sample response sheet. Visit /dubug in development mode to make yourself admin.");
    }
  }, []);


  // Fetch history from local storage
  useEffect(() => {
    const storedHistory = localStorage.getItem("examHistory")
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory)
        setHistory(parsedHistory)
      } catch (error) {
        console.error("Failed to parse exam history from local storage", error)
      }
    }
  }, [])

  // Save history to local storage whenever it changes
  useEffect(() => {
    if (!history || history.length === 0) return
    // Limit history to last 5 entries
    const limitedHistory = history.slice(-5)
    localStorage.setItem("examHistory", JSON.stringify(limitedHistory))
  }, [history])

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

  
  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams")
      const data = await response.json()

      if (data.success) {
        setExams(data.exams)
        setSelectedExam(data.exams[0] || null)
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

    setIsLoading(true)
    try {
      let finalInput = responseInput

      const selectedDateObj = availableDates.find((d) => d.id === selectedDate)
      const selectedShiftObj = availableShifts.find((s) => s.id === selectedShift)
      const selectedCombinationObj = availableCombinations.find((c) => c.id === selectedCombination)

      // Save to history without duplicates
      const newHistoryEntry: ExamHistory = {
        inputType,
        responseInput: finalInput,
        selectedExam,
        selectedDate: selectedDateObj?.id || "",
        selectedShift: selectedShiftObj?.id || "",
        selectedCombination: selectedCombinationObj?.id || "",
      }

      setHistory((prev) => {
        const isDuplicate = prev.some(
          (entry) =>
        entry.inputType === newHistoryEntry.inputType &&
        entry.responseInput === newHistoryEntry.responseInput &&
        entry.selectedExam?.id === newHistoryEntry.selectedExam?.id &&
        entry.selectedDate === newHistoryEntry.selectedDate &&
        entry.selectedShift === newHistoryEntry.selectedShift &&
        entry.selectedCombination === newHistoryEntry.selectedCombination
        )
        return isDuplicate ? prev : [...prev, newHistoryEntry]
      })

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
      {message && (
      <div className="absolute top-14 left-0 right-0 z-50">
        <div className="bg-blue-400 text-white text-center py-3 animate-slide-down flex items-center justify-between px-4">
        <span>{message}</span>
        <button
          className="text-white font-bold"
          onClick={() => setMessage(null)}
        >
          Dismiss
        </button>
        </div>
      </div>
      )}
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Exam Response Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            Calculate Your JEE, NEET, and CUET Exam Marks with Ease
          </p>
          {selectedExam && (
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {selectedExam.displayName}
              </Badge>
              <span className="text-sm text-gray-500">
                • {(selectedExam.description ?? "").length > 100
                  ? `${(selectedExam.description ?? "").slice(0, 100)}...`
                  : selectedExam.description}
              </span>
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
              <div className="flex max-w-full flex-wrap md:flex-nowrap justify-between gap-4">
                <div className="w-full">
                  <Label htmlFor="exam" className="flex items-center gap-2 mb-2">
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
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full">
                  <Label htmlFor="date" className="flex items-center gap-2 mb-2">
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

                <div className="w-full">
                  <Label htmlFor="shift" className="flex items-center gap-2 mb-2">
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
                  <div className="w-full">
                    <Label htmlFor="combination" className="flex items-center gap-2 mb-2">
                      <Paperclip className="h-4 w-4" />
                      Subject Combination</Label>
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
              <Tabs value={inputType} onValueChange={(value) => setInputType(value as "url" | "paste")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="paste" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Paste
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
              </Tabs>

              <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? "Analyzing..." : "Analyze Response Sheet"}
              </Button>


              {/* Show all the history with use button */}
              {history.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Analysis History</h3>
                  <div className="space-y-2">
                    {history.map((entry, index) => (
                      <Card key={index} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {entry.selectedExam?.displayName || "Unknown Exam"}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {entry.selectedDate ? entry.selectedExam?.dates.find((d) => d.id === entry.selectedDate)?.formattedDate : "No date selected"}
                                {" "}
                                {entry.selectedShift ? `- ${entry.selectedExam?.dates.find((d) => d.id === entry.selectedDate)?.shifts.find((s) => s.id === entry.selectedShift)?.name}` : ""}
                                {entry.selectedCombination ? ` - ${entry.selectedExam?.dates.find((d) => d.id === entry.selectedDate)?.shifts.find((s) => s.id === entry.selectedShift)?.combinations.find((c) => c.id === entry.selectedCombination)?.name}` : ""}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedExam(entry.selectedExam || null);
                                setSelectedDate(entry.selectedDate || "");
                                setSelectedShift(entry.selectedShift || "");
                                setSelectedCombination(entry.selectedCombination || "");
                                setResponseInput(entry.responseInput || "");
                                setInputType(entry.inputType || "url");
                              }}
                            >
                              Use This
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
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
        {/* Detailed information about the technology and data processing for better SEO */}
        <div className="max-w-3xl mx-auto mt-12 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How This Tool Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-md font-semibold">Advanced Parsing Technology</h3>
                <p className="text-sm text-gray-700">
                  Our tool uses advanced PDF parsing and HTML content extraction algorithms to process your response sheets.
                  It ensures accurate data extraction, even from complex formats, to provide reliable results.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-700">
                  The analysis engine is powered by AI models that evaluate your responses against the provided answer key.
                  It calculates your marks and generates detailed subject-wise performance insights.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">Real-Time Processing</h3>
                <p className="text-sm text-gray-700">
                  Our system processes your data in real-time, ensuring you get instant results without any delays.
                  The entire process is optimized for speed and accuracy.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How Your Data is Processed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-md font-semibold">Secure Uploads</h3>
                <p className="text-sm text-gray-700">
                  When you upload your response sheet, it is securely transmitted to our servers using encrypted connections.
                  We ensure that your data remains private and protected during the upload process.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">Temporary Storage</h3>
                <p className="text-sm text-gray-700">
                  Your response sheet data is stored temporarily on our servers for processing.
                  Once the analysis is complete, the data is automatically deleted to ensure your privacy.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">No Third-Party Sharing</h3>
                <p className="text-sm text-gray-700">
                  We do not share your data with any third parties. All processing is done in-house,
                  and your information is never used for purposes other than the analysis you requested.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Why Choose This Tool?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-md font-semibold">Accuracy You Can Trust</h3>
                <p className="text-sm text-gray-700">
                  Our tool is designed to provide highly accurate results by leveraging cutting-edge technology.
                  You can rely on it to analyze your performance with precision.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">User-Friendly Interface</h3>
                <p className="text-sm text-gray-700">
                  The interface is intuitive and easy to use, making it accessible for students of all technical skill levels.
                  You can complete the analysis in just a few clicks.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">Comprehensive Insights</h3>
                <p className="text-sm text-gray-700">
                  Beyond just marks, the tool provides detailed insights into your subject-wise performance,
                  helping you identify strengths and areas for improvement.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* More contents with FAQs for this JEE, NEET, CUET marks calculator */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-md font-semibold">What is this tool?</h3>
                <p className="text-sm text-gray-700">
                  This tool allows students to analyze their exam response sheets for JEE, NEET, and CUET exams.
                  It calculates marks based on the provided answer key and gives detailed subject-wise performance analysis.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">How do I use it?</h3>
                <p className="text-sm text-gray-700">
                  Select your exam, date, and shift. Then provide your response sheet either by URL, pasting the content,
                  or uploading a PDF file. If the answer key is not available, you can submit it for approval.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">What if the answer key is not available?</h3>
                <p className="text-sm text-gray-700">
                  If the answer key is not available, you can submit it for approval.
                  The admin will review and approve it, after which you can analyze your response sheet.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">Is my data secure?</h3>
                <p className="text-sm text-gray-700">
                  Yes, we take data security seriously. Your response sheets and personal information are processed securely
                  and are not shared with third parties without your consent.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-md font-semibold">Who can use this tool?</h3>
                <p className="text-sm text-gray-700">
                  This tool is designed for students appearing for JEE, NEET, and CUET exams.
                  It can be used by anyone who has their response sheet and wants to analyze their performance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
