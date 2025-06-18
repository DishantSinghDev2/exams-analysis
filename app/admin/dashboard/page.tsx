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
import { LogOut, Upload, Check, X, Eye, BarChart3, Clock, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PendingAnswerKey {
  id: string
  examDate: string
  shift: string
  subjectCombination: string
  subject: string
  answerKeyData: string
  submittedBy: string
  createdAt: string
}

interface AdminStats {
  totalResponses: number
  totalAnswerKeys: number
  pendingKeys: number
  recentResponses: Array<{
    id: string
    candidateName: string
    examDate: string
    shift: string
    subjectCombination: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [pendingKeys, setPendingKeys] = useState<PendingAnswerKey[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)

  // Form states for uploading answer keys
  const [examDate, setExamDate] = useState("")
  const [shift, setShift] = useState("")
  const [subjectCombination, setSubjectCombination] = useState("")
  const [answerKeyData, setAnswerKeyData] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/admin/login")
      return
    }
    fetchPendingKeys()
    fetchStats()
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

  const handleUploadAnswerKey = async () => {
    if (!examDate || !shift || !subjectCombination || !answerKeyData) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/upload-answer-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate,
          shift,
          subjectCombination,
          answerKeyData,
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Answer key uploaded successfully",
        })
        setExamDate("")
        setShift("")
        setSubjectCombination("")
        setAnswerKeyData("")
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
      <div className="max-w-6xl mx-auto">
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
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recentResponses.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Answer Key</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Approvals
              {pendingKeys.length > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">{pendingKeys.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Answer Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div>
                  <Label htmlFor="answerKeyData">Answer Key Data</Label>
                  <Textarea
                    id="answerKeyData"
                    placeholder="Sno | Subject | QuestionID | Correct Option(s) | Option ID(s) Claimed&#10;1 | Biology | 226895708462 | 3 | 2268952746936&#10;2 | Biology | 226895708452 | 4 | 2268952746897"
                    value={answerKeyData}
                    onChange={(e) => setAnswerKeyData(e.target.value)}
                    rows={10}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Format: Sno | Subject | QuestionID | Correct Option(s) | Option ID(s) Claimed
                  </p>
                </div>

                <Button onClick={handleUploadAnswerKey} disabled={isLoading} className="w-full">
                  {isLoading ? "Uploading..." : "Upload Answer Key"}
                </Button>
              </CardContent>
            </Card>
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
                            {key.subject} - {key.examDate}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {key.shift} | {key.subjectCombination}
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
        </Tabs>
      </div>
    </div>
  )
}
