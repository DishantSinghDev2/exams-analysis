"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  LogOut,
  Upload,
  Check,
  X,
  Eye,
  BarChart3,
  Clock,
  Calendar,
  Plus,
  GraduationCap,
  Sparkles,
  FileText,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatExamDate } from "@/lib/date-utils"
import MarkingSchemeManager from "@/components/marking-scheme-manager"

interface PendingAnswerKey {
  id: string
  examName: string
  examYear: string
  examDate: string
  shiftName: string
  subjectCombination?: string
  subject: string
  answerKeyData: string
  submittedBy: string
  createdAt: string
}

interface ExamData {
  id: string
  name: string
  year: string
  description?: string
  hasSubjectCombinations: boolean
  isActive: boolean
  examDates: Array<{
    id: string
    date: string
    isActive: boolean
    examShifts: Array<{
      id: string
      shiftName: string
      startTime?: string
      endTime?: string
      isActive: boolean
      subjectCombinations: Array<{
        id: string
        name: string
        subjects: string[]
        isActive: boolean
      }>
    }>
  }>
}

interface AdminStats {
  totalResponses: number
  totalAnswerKeys: number
  pendingKeys: number
  recentResponses: Array<{
    id: string
    candidateName: string
    examName: string
    examYear: string
    examDate: string
    shiftName: string
    subjectCombination?: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [pendingKeys, setPendingKeys] = useState<PendingAnswerKey[]>([])
  const [exams, setExams] = useState<ExamData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)

  // Form states for creating exams
  const [newExamName, setNewExamName] = useState("")
  const [newExamYear, setNewExamYear] = useState("")
  const [newExamDescription, setNewExamDescription] = useState("")
  const [newExamHasCombinations, setNewExamHasCombinations] = useState(false)

  // Form states for adding dates
  const [selectedExamForDate, setSelectedExamForDate] = useState("")
  const [newExamDate, setNewExamDate] = useState("")

  // Form states for adding shifts
  const [selectedDateForShift, setSelectedDateForShift] = useState("")
  const [newShiftName, setNewShiftName] = useState("")
  const [newShiftStartTime, setNewShiftStartTime] = useState("")
  const [newShiftEndTime, setNewShiftEndTime] = useState("")

  // Form states for adding combinations
  const [selectedShiftForCombination, setSelectedShiftForCombination] = useState("")
  const [newCombinationName, setNewCombinationName] = useState("")
  const [newCombinationSubjects, setNewCombinationSubjects] = useState("")

  // Form states for uploading answer keys
  const [answerKeyExam, setAnswerKeyExam] = useState("")
  const [answerKeyDate, setAnswerKeyDate] = useState("")
  const [answerKeyShift, setAnswerKeyShift] = useState("")
  const [answerKeyCombination, setAnswerKeyCombination] = useState("")
  const [answerKeyData, setAnswerKeyData] = useState("")

  // Form states for manual answer key entry
  const [manualExam, setManualExam] = useState("")
  const [manualDate, setManualDate] = useState("")
  const [manualShift, setManualShift] = useState("")
  const [manualCombination, setManualCombination] = useState("")
  const [manualSubject, setManualSubject] = useState("")
  const [manualAnswers, setManualAnswers] = useState<Array<{ questionId: string; correctAnswerId: string }>>([])

  // AI formatting states
  const [rawAnswerKeyData, setRawAnswerKeyData] = useState("")
  const [isFormatting, setIsFormatting] = useState(false)
  const [showAIPreview, setShowAIPreview] = useState(false)
  const [aiFormattedData, setAiFormattedData] = useState<Array<{ sno: string; questionId: string; answerId: string }>>(
    [],
  )

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/login")
      return
    }
    fetchPendingKeys()
    fetchStats()
    fetchExams()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchPendingKeys = async () => {
    try {
      const response = await fetch("/api/admin/pending-keys")
      const data = await response.json()
      if (data.success) {
        setPendingKeys(data.pendingKeys)
      }
    } catch (error) {
      console.error("Failed to fetch pending keys:", error)
    }
  }

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/admin/exams")
      const data = await response.json()
      if (data.success) {
        setExams(data.exams)
      }
    } catch (error) {
      console.error("Failed to fetch exams:", error)
    }
  }

  const handleCreateExam = async () => {
    if (!newExamName || !newExamYear) {
      toast({
        title: "Missing Information",
        description: "Please provide exam name and year",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newExamName,
          year: newExamYear,
          description: newExamDescription,
          hasSubjectCombinations: newExamHasCombinations,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Exam created successfully",
        })
        setNewExamName("")
        setNewExamYear("")
        setNewExamDescription("")
        setNewExamHasCombinations(false)
        fetchExams()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleAddExamDate = async () => {
    if (!selectedExamForDate || !newExamDate) {
      toast({
        title: "Missing Information",
        description: "Please select exam and provide date",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/exam-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: selectedExamForDate,
          date: newExamDate,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Exam date added successfully",
        })
        setSelectedExamForDate("")
        setNewExamDate("")
        fetchExams()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Addition Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleAddExamShift = async () => {
    if (!selectedDateForShift || !newShiftName) {
      toast({
        title: "Missing Information",
        description: "Please select exam date and provide shift name",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/admin/exam-shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDateId: selectedDateForShift,
          shiftName: newShiftName,
          startTime: newShiftStartTime || null,
          endTime: newShiftEndTime || null,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Exam shift added successfully",
        })
        setSelectedDateForShift("")
        setNewShiftName("")
        setNewShiftStartTime("")
        setNewShiftEndTime("")
        fetchExams()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Addition Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleAddSubjectCombination = async () => {
    if (!selectedShiftForCombination || !newCombinationName || !newCombinationSubjects) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const subjects = newCombinationSubjects
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)

      const response = await fetch("/api/admin/subject-combinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examShiftId: selectedShiftForCombination,
          name: newCombinationName,
          subjects: subjects,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Subject combination added successfully",
        })
        setSelectedShiftForCombination("")
        setNewCombinationName("")
        setNewCombinationSubjects("")
        fetchExams()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Addition Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleUploadAnswerKey = async () => {
    if (!answerKeyExam || !answerKeyDate || !answerKeyShift || !answerKeyData) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const [examName, examYear] = answerKeyExam.split("|")

      const response = await fetch("/api/admin/upload-answer-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examName,
          examYear,
          examDate: answerKeyDate,
          shiftName: answerKeyShift,
          subjectCombination: answerKeyCombination || "",
          answerKeyData,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        setAnswerKeyExam("")
        setAnswerKeyDate("")
        setAnswerKeyShift("")
        setAnswerKeyCombination("")
        setAnswerKeyData("")
        fetchStats()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormatWithAI = async () => {
    if (!rawAnswerKeyData.trim()) {
      toast({
        title: "Missing Data",
        description: "Please paste your answer key data first",
        variant: "destructive",
      })
      return
    }

    setIsFormatting(true)
    try {
      const response = await fetch("/api/admin/format-answer-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawAnswerKey: rawAnswerKeyData }),
      })

      const data = await response.json()
      if (data.success) {
        setAiFormattedData(data.formattedData)
        setShowAIPreview(true)
        toast({
          title: "Success",
          description: data.message,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "AI Formatting Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsFormatting(false)
    }
  }

  const handleUseAIFormattedData = () => {
    const formattedAnswers = aiFormattedData.map((item) => ({
      questionId: item.questionId,
      correctAnswerId: item.answerId,
    }))
    setManualAnswers(formattedAnswers)
    setShowAIPreview(false)
    setRawAnswerKeyData("")
    setAiFormattedData([])
    toast({
      title: "Data Imported",
      description: `${formattedAnswers.length} answers imported to manual entry`,
    })
  }

  const handleAddManualAnswer = () => {
    setManualAnswers([...manualAnswers, { questionId: "", correctAnswerId: "" }])
  }

  const handleRemoveManualAnswer = (index: number) => {
    setManualAnswers(manualAnswers.filter((_, i) => i !== index))
  }

  const handleManualAnswerChange = (index: number, field: "questionId" | "correctAnswerId", value: string) => {
    const updated = [...manualAnswers]
    updated[index][field] = value
    setManualAnswers(updated)
  }

  const handleSaveManualAnswerKey = async () => {
    if (!manualExam || !manualDate || !manualShift || !manualSubject || manualAnswers.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and add at least one answer",
        variant: "destructive",
      })
      return
    }

    // Validate all answers have both fields filled
    const invalidAnswers = manualAnswers.filter((a) => !a.questionId || !a.correctAnswerId)
    if (invalidAnswers.length > 0) {
      toast({
        title: "Invalid Answers",
        description: "Please fill in both Question ID and Answer ID for all entries",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const [examName, examYear] = manualExam.split("|")

      const response = await fetch("/api/admin/manual-answer-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examName,
          examYear,
          examDate: manualDate,
          shiftName: manualShift,
          subjectCombination: manualCombination || "",
          subject: manualSubject,
          answers: manualAnswers,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        setManualExam("")
        setManualDate("")
        setManualShift("")
        setManualCombination("")
        setManualSubject("")
        setManualAnswers([])
        fetchStats()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveKey = async (keyId: string) => {
    try {
      const response = await fetch("/api/admin/approve-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Approved",
          description: "Answer key has been approved and saved",
        })
        fetchPendingKeys()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleRejectKey = async (keyId: string) => {
    try {
      const response = await fetch("/api/admin/reject-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Rejected",
          description: "Answer key has been rejected",
        })
        fetchPendingKeys()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {session.user?.name}</p>
          </div>
          <Button onClick={() => signOut()} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Responses</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Answer Keys</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAnswerKeys}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingKeys}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Exams</p>
                    <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="exams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="exams">Manage Exams</TabsTrigger>
            <TabsTrigger value="upload">Upload Answer Key</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="marking">Marking Schemes</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Approvals
              {pendingKeys.length > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">{pendingKeys.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="exams">
            <div className="space-y-6">
              {/* Create New Exam */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Exam
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="examName">Exam Name</Label>
                      <Input
                        id="examName"
                        placeholder="e.g., NEET, JEE Mains"
                        value={newExamName}
                        onChange={(e) => setNewExamName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="examYear">Year</Label>
                      <Input
                        id="examYear"
                        placeholder="e.g., 2025"
                        value={newExamYear}
                        onChange={(e) => setNewExamYear(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="examDescription">Description (Optional)</Label>
                      <Input
                        id="examDescription"
                        placeholder="e.g., National Eligibility cum Entrance Test"
                        value={newExamDescription}
                        onChange={(e) => setNewExamDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasCombinations"
                      checked={newExamHasCombinations}
                      onCheckedChange={(checked) => setNewExamHasCombinations(checked === true)}
                    />
                    <Label htmlFor="hasCombinations">This exam has subject combinations</Label>
                  </div>
                  <Button onClick={handleCreateExam} className="w-full">
                    Create Exam
                  </Button>
                </CardContent>
              </Card>

              {/* Add Exam Date */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Add Exam Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="examForDate">Select Exam</Label>
                      <Select value={selectedExamForDate} onValueChange={setSelectedExamForDate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((exam) => (
                            <SelectItem key={exam.id} value={exam.id}>
                              {exam.name} {exam.year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="examDate">Exam Date</Label>
                      <Input
                        id="examDate"
                        type="date"
                        value={newExamDate}
                        onChange={(e) => setNewExamDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddExamDate} disabled={!selectedExamForDate || !newExamDate}>
                    Add Date
                  </Button>
                </CardContent>
              </Card>

              {/* Add Exam Shift */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Add Exam Shift
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="dateForShift">Select Exam Date</Label>
                      <Select value={selectedDateForShift} onValueChange={setSelectedDateForShift}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose date" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.flatMap((exam) =>
                            exam.examDates.map((date) => (
                              <SelectItem key={date.id} value={date.id}>
                                {exam.name} {exam.year} - {formatExamDate(new Date(date.date))}
                              </SelectItem>
                            )),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="shiftName">Shift Name</Label>
                      <Input
                        id="shiftName"
                        placeholder="e.g., Shift 1, Morning"
                        value={newShiftName}
                        onChange={(e) => setNewShiftName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Start Time (Optional)</Label>
                      <Input
                        id="startTime"
                        placeholder="e.g., 09:00 AM"
                        value={newShiftStartTime}
                        onChange={(e) => setNewShiftStartTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time (Optional)</Label>
                      <Input
                        id="endTime"
                        placeholder="e.g., 12:00 PM"
                        value={newShiftEndTime}
                        onChange={(e) => setNewShiftEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddExamShift} disabled={!selectedDateForShift || !newShiftName}>
                    Add Shift
                  </Button>
                </CardContent>
              </Card>

              {/* Add Subject Combination */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Subject Combination</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="shiftForCombination">Select Exam Shift</Label>
                      <Select value={selectedShiftForCombination} onValueChange={setSelectedShiftForCombination}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose shift" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams
                            .filter((exam) => exam.hasSubjectCombinations)
                            .flatMap((exam) =>
                              exam.examDates.flatMap((date) =>
                                date.examShifts.map((shift) => (
                                  <SelectItem key={shift.id} value={shift.id}>
                                    {exam.name} {exam.year} - {formatExamDate(new Date(date.date))} - {shift.shiftName}
                                  </SelectItem>
                                )),
                              ),
                            )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="combinationName">Combination Name</Label>
                      <Input
                        id="combinationName"
                        placeholder="e.g., PCB, PCM, Combination 1"
                        value={newCombinationName}
                        onChange={(e) => setNewCombinationName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                      <Input
                        id="subjects"
                        placeholder="e.g., Physics, Chemistry, Biology"
                        value={newCombinationSubjects}
                        onChange={(e) => setNewCombinationSubjects(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddSubjectCombination}
                    disabled={!selectedShiftForCombination || !newCombinationName || !newCombinationSubjects}
                  >
                    Add Subject Combination
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Exams */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Exams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exams.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No exams available</p>
                    ) : (
                      exams.map((exam) => (
                        <div key={exam.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">
                                {exam.name} {exam.year}
                              </h4>
                              {exam.description && <p className="text-sm text-gray-600">{exam.description}</p>}
                              <div className="flex gap-2 mt-1">
                                <Badge variant={exam.hasSubjectCombinations ? "default" : "secondary"}>
                                  {exam.hasSubjectCombinations ? "Has Combinations" : "No Combinations"}
                                </Badge>
                                <Badge variant={exam.isActive ? "default" : "secondary"}>
                                  {exam.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {exam.examDates.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <h5 className="font-medium text-sm">Exam Dates & Shifts:</h5>
                              {exam.examDates.map((date) => (
                                <div key={date.id} className="ml-4 border-l-2 border-gray-200 pl-3">
                                  <p className="text-sm font-medium">{formatExamDate(new Date(date.date))}</p>
                                  {date.examShifts.map((shift) => (
                                    <div key={shift.id} className="ml-4 mt-1">
                                      <p className="text-xs text-gray-600">
                                        {shift.shiftName}
                                        {shift.startTime && shift.endTime && (
                                          <span>
                                            {" "}
                                            ({shift.startTime} - {shift.endTime})
                                          </span>
                                        )}
                                      </p>
                                      {shift.subjectCombinations.length > 0 && (
                                        <div className="ml-2 mt-1">
                                          {shift.subjectCombinations.map((combo) => (
                                            <Badge key={combo.id} variant="outline" className="text-xs mr-1">
                                              {combo.name}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Answer Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="answerKeyExam">Exam</Label>
                    <Select value={answerKeyExam} onValueChange={setAnswerKeyExam}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {exams.map((exam) => (
                          <SelectItem key={exam.id} value={`${exam.name}|${exam.year}`}>
                            {exam.name} {exam.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="answerKeyDate">Date</Label>
                    <Select value={answerKeyDate} onValueChange={setAnswerKeyDate} disabled={!answerKeyExam}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        {answerKeyExam &&
                          exams
                            .find((exam) => `${exam.name}|${exam.year}` === answerKeyExam)
                            ?.examDates.map((date) => (
                              <SelectItem key={date.id} value={date.date}>
                                {formatExamDate(new Date(date.date))}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="answerKeyShift">Shift</Label>
                    <Select value={answerKeyShift} onValueChange={setAnswerKeyShift} disabled={!answerKeyDate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {answerKeyExam &&
                          answerKeyDate &&
                          exams
                            .find((exam) => `${exam.name}|${exam.year}` === answerKeyExam)
                            ?.examDates.find((date) => date.date === answerKeyDate)
                            ?.examShifts.map((shift) => (
                              <SelectItem key={shift.id} value={shift.shiftName}>
                                {shift.shiftName}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="answerKeyCombination">Combination (Optional)</Label>
                    <Select
                      value={answerKeyCombination}
                      onValueChange={setAnswerKeyCombination}
                      disabled={!answerKeyShift}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select combination" />
                      </SelectTrigger>
                      <SelectContent>
                        {answerKeyExam &&
                          answerKeyDate &&
                          answerKeyShift &&
                          exams
                            .find((exam) => `${exam.name}|${exam.year}` === answerKeyExam)
                            ?.examDates.find((date) => date.date === answerKeyDate)
                            ?.examShifts.find((shift) => shift.shiftName === answerKeyShift)
                            ?.subjectCombinations.map((combo) => (
                              <SelectItem key={combo.id} value={combo.name}>
                                {combo.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="answerKeyData">Answer Key Data</Label>
                  <Textarea
                    id="answerKeyData"
                    placeholder="Sno	Subject	QuestionID	Correct Answer ID&#10;1	BIOLOGY	226895708423	2268952746780&#10;2	BIOLOGY	226895708424	2268952746784"
                    value={answerKeyData}
                    onChange={(e) => setAnswerKeyData(e.target.value)}
                    rows={10}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Format: Tab-separated values with columns: Sno, Subject, QuestionID, Correct Answer ID
                  </p>
                </div>

                <Button
                  onClick={handleUploadAnswerKey}
                  disabled={isLoading || !answerKeyExam || !answerKeyDate || !answerKeyShift || !answerKeyData}
                  className="w-full"
                >
                  {isLoading ? "Uploading..." : "Upload Answer Key"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual">
            <div className="space-y-6">
              {/* AI Formatting Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI-Powered Answer Key Formatting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rawAnswerKey">Paste Your Answer Key (Any Format)</Label>
                    <Textarea
                      id="rawAnswerKey"
                      placeholder="Paste your answer key data here in any format. AI will automatically format it for you.&#10;&#10;Example:&#10;1	304-BIOLOGY/ BIOLOGICAL SCIENCE/ BIOTECHNOLOGY /BIOCHEMISTRY	226895708423	2268952746780&#10;2268952746778	2268952746779	2268952746780	2268952746781	None of These&#10;2	304-BIOLOGY/ BIOLOGICAL SCIENCE/ BIOTECHNOLOGY /BIOCHEMISTRY	226895708424	2268952746784"
                      value={rawAnswerKeyData}
                      onChange={(e) => setRawAnswerKeyData(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <Button
                    onClick={handleFormatWithAI}
                    disabled={isFormatting || !rawAnswerKeyData.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isFormatting ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        AI is formatting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Format with AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* AI Preview Section */}
              {showAIPreview && aiFormattedData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      AI Formatted Preview ({aiFormattedData.length} answers)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left">Sno</th>
                            <th className="px-3 py-2 text-left">Question ID</th>
                            <th className="px-3 py-2 text-left">Answer ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aiFormattedData.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-3 py-2">{item.sno}</td>
                              <td className="px-3 py-2 font-mono">{item.questionId}</td>
                              <td className="px-3 py-2 font-mono">{item.answerId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleUseAIFormattedData} className="flex-1">
                        <Check className="h-4 w-4 mr-2" />
                        Use This Data
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAIPreview(false)
                          setAiFormattedData([])
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Manual Entry Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Manual Answer Key Entry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Exam Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="manualExam">Exam</Label>
                      <Select value={manualExam} onValueChange={setManualExam}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((exam) => (
                            <SelectItem key={exam.id} value={`${exam.name}|${exam.year}`}>
                              {exam.name} {exam.year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="manualDate">Date</Label>
                      <Select value={manualDate} onValueChange={setManualDate} disabled={!manualExam}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent>
                          {manualExam &&
                            exams
                              .find((exam) => `${exam.name}|${exam.year}` === manualExam)
                              ?.examDates.map((date) => (
                                <SelectItem key={date.id} value={date.date}>
                                  {formatExamDate(new Date(date.date))}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="manualShift">Shift</Label>
                      <Select value={manualShift} onValueChange={setManualShift} disabled={!manualDate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          {manualExam &&
                            manualDate &&
                            exams
                              .find((exam) => `${exam.name}|${exam.year}` === manualExam)
                              ?.examDates.find((date) => date.date === manualDate)
                              ?.examShifts.map((shift) => (
                                <SelectItem key={shift.id} value={shift.shiftName}>
                                  {shift.shiftName}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="manualCombination">Combination (Optional)</Label>
                      <Select value={manualCombination} onValueChange={setManualCombination} disabled={!manualShift}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select combination" />
                        </SelectTrigger>
                        <SelectContent>
                          {manualExam &&
                            manualDate &&
                            manualShift &&
                            exams
                              .find((exam) => `${exam.name}|${exam.year}` === manualExam)
                              ?.examDates.find((date) => date.date === manualDate)
                              ?.examShifts.find((shift) => shift.shiftName === manualShift)
                              ?.subjectCombinations.map((combo) => (
                                <SelectItem key={combo.id} value={combo.name}>
                                  {combo.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="manualSubject">Subject</Label>
                      <Input
                        id="manualSubject"
                        placeholder="e.g., Biology, Physics"
                        value={manualSubject}
                        onChange={(e) => setManualSubject(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Answer Entries */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium">Answer Key Entries</h4>
                      <Button onClick={handleAddManualAnswer} size="sm" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Answer
                      </Button>
                    </div>

                    {manualAnswers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No answers added yet. Use AI formatting above or click "Add Answer" to start manually.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {manualAnswers.map((answer, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-12 text-center text-sm text-gray-500">#{index + 1}</div>
                            <div className="flex-1">
                              <Label htmlFor={`question-${index}`}>Question ID</Label>
                              <Input
                                id={`question-${index}`}
                                placeholder="e.g., 226895708423"
                                value={answer.questionId}
                                onChange={(e) => handleManualAnswerChange(index, "questionId", e.target.value)}
                              />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={`answer-${index}`}>Correct Answer ID</Label>
                              <Input
                                id={`answer-${index}`}
                                placeholder="e.g., 2268952746780"
                                value={answer.correctAnswerId}
                                onChange={(e) => handleManualAnswerChange(index, "correctAnswerId", e.target.value)}
                              />
                            </div>
                            <Button
                              onClick={() => handleRemoveManualAnswer(index)}
                              variant="destructive"
                              size="sm"
                              className="mt-6"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveManualAnswerKey}
                    disabled={
                      isLoading ||
                      !manualExam ||
                      !manualDate ||
                      !manualShift ||
                      !manualSubject ||
                      manualAnswers.length === 0
                    }
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? "Saving..." : `Save Answer Key (${manualAnswers.length} answers)`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="space-y-4">
              {pendingKeys.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No pending answer keys for approval</p>
                  </CardContent>
                </Card>
              ) : (
                pendingKeys.map((key) => (
                  <Card key={key.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {key.subject} - {key.examName} {key.examYear}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {formatExamDate(new Date(key.examDate))} | {key.shiftName}
                            {key.subjectCombination && ` | ${key.subjectCombination}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Submitted by: {key.submittedBy} on {new Date(key.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveKey(key.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectKey(key.id)}>
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <details className="cursor-pointer">
                        <summary className="flex items-center gap-2 font-medium">
                          <Eye className="h-4 w-4" />
                          View Answer Key Data
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">{key.answerKeyData}</pre>
                      </details>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.recentResponses && stats.recentResponses.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentResponses.map((response) => (
                        <div key={response.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <p className="font-medium">{response.candidateName}</p>
                            <p className="text-sm text-gray-600">
                              {response.examName} {response.examYear} - {response.shiftName}
                              {response.subjectCombination && ` - ${response.subjectCombination}`}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(response.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Database</span>
                      <Badge variant="default">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Answer Key Processing</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>File Upload</span>
                      <Badge variant="default">Available</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI Formatting</span>
                      <Badge variant="default">Available</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="marking">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Exam for Marking Scheme Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="markingExam">Exam</Label>
                      <Select value={answerKeyExam} onValueChange={setAnswerKeyExam}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((exam) => (
                            <SelectItem key={exam.id} value={`${exam.name}|${exam.year}`}>
                              {exam.name} {exam.year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="markingDate">Date</Label>
                      <Select value={answerKeyDate} onValueChange={setAnswerKeyDate} disabled={!answerKeyExam}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent>
                          {answerKeyExam &&
                            exams
                              .find((exam) => `${exam.name}|${exam.year}` === answerKeyExam)
                              ?.examDates.map((date) => (
                                <SelectItem key={date.id} value={date.date}>
                                  {formatExamDate(new Date(date.date))}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="markingShift">Shift</Label>
                      <Select value={answerKeyShift} onValueChange={setAnswerKeyShift} disabled={!answerKeyDate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          {answerKeyExam &&
                            answerKeyDate &&
                            exams
                              .find((exam) => `${exam.name}|${exam.year}` === answerKeyExam)
                              ?.examDates.find((date) => date.date === answerKeyDate)
                              ?.examShifts.map((shift) => (
                                <SelectItem key={shift.id} value={shift.shiftName}>
                                  {shift.shiftName}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="markingCombination">Combination (Optional)</Label>
                      <Select
                        value={answerKeyCombination}
                        onValueChange={setAnswerKeyCombination}
                        disabled={!answerKeyShift}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select combination" />
                        </SelectTrigger>
                        <SelectContent>
                          {answerKeyExam &&
                            answerKeyDate &&
                            answerKeyShift &&
                            exams
                              .find((exam) => `${exam.name}|${exam.year}` === answerKeyExam)
                              ?.examDates.find((date) => date.date === answerKeyDate)
                              ?.examShifts.find((shift) => shift.shiftName === answerKeyShift)
                              ?.subjectCombinations.map((combo) => (
                                <SelectItem key={combo.id} value={combo.name}>
                                  {combo.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {answerKeyExam && answerKeyDate && answerKeyShift && (
                <MarkingSchemeManager
                  examName={answerKeyExam.split("|")[0]}
                  examYear={answerKeyExam.split("|")[1]}
                  examDate={answerKeyDate}
                  shiftName={answerKeyShift}
                  subjectCombination={answerKeyCombination}
                  onSchemeUpdate={fetchStats}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
