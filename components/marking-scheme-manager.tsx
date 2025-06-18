"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MarkingScheme {
  id: string
  examName: string
  examYear: string
  examDate: string
  shiftName: string
  subjectCombination?: string
  subject: string
  correctMarks: number
  incorrectMarks: number
  unattemptedMarks: number
  totalQuestions: number
  totalMarks: number
}

interface MarkingSchemeManagerProps {
  examName: string
  examYear: string
  examDate: string
  shiftName: string
  subjectCombination?: string
  onSchemeUpdate?: () => void
}

export default function MarkingSchemeManager({
  examName,
  examYear,
  examDate,
  shiftName,
  subjectCombination,
  onSchemeUpdate,
}: MarkingSchemeManagerProps) {
  const { toast } = useToast()
  const [schemes, setSchemes] = useState<MarkingScheme[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingScheme, setEditingScheme] = useState<MarkingScheme | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    correctMarks: 4,
    incorrectMarks: -1,
    unattemptedMarks: 0,
    totalQuestions: 50,
  })

  useEffect(() => {
    fetchMarkingSchemes()
  }, [examName, examYear, examDate, shiftName, subjectCombination])

  const fetchMarkingSchemes = async () => {
    try {
      const params = new URLSearchParams({
        examName,
        examYear,
        examDate,
        shiftName,
        ...(subjectCombination && { subjectCombination }),
      })

      const response = await fetch(`/api/admin/marking-schemes?${params}`)
      const data = await response.json()

      if (data.success) {
        setSchemes(data.schemes)
      }
    } catch (error) {
      console.error("Failed to fetch marking schemes:", error)
    }
  }

  const handleSaveScheme = async () => {
    if (!formData.subject) {
      toast({
        title: "Missing Information",
        description: "Please provide subject name",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const totalMarks = formData.totalQuestions * formData.correctMarks

      const payload = {
        examName,
        examYear,
        examDate,
        shiftName,
        subjectCombination: subjectCombination || "",
        subject: formData.subject,
        correctMarks: formData.correctMarks,
        incorrectMarks: formData.incorrectMarks,
        unattemptedMarks: formData.unattemptedMarks,
        totalQuestions: formData.totalQuestions,
        totalMarks,
      }

      const response = await fetch("/api/admin/marking-schemes", {
        method: editingScheme ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          ...(editingScheme && { id: editingScheme.id }),
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: `Marking scheme ${editingScheme ? "updated" : "created"} successfully`,
        })
        setFormData({
          subject: "",
          correctMarks: 4,
          incorrectMarks: -1,
          unattemptedMarks: 0,
          totalQuestions: 50,
        })
        setEditingScheme(null)
        setIsCreating(false)
        fetchMarkingSchemes()
        onSchemeUpdate?.()
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

  const handleEditScheme = (scheme: MarkingScheme) => {
    setEditingScheme(scheme)
    setFormData({
      subject: scheme.subject,
      correctMarks: scheme.correctMarks,
      incorrectMarks: scheme.incorrectMarks,
      unattemptedMarks: scheme.unattemptedMarks,
      totalQuestions: scheme.totalQuestions,
    })
    setIsCreating(true)
  }

  const handleDeleteScheme = async (schemeId: string) => {
    if (!confirm("Are you sure you want to delete this marking scheme?")) return

    try {
      const response = await fetch(`/api/admin/marking-schemes/${schemeId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Marking scheme deleted successfully",
        })
        fetchMarkingSchemes()
        onSchemeUpdate?.()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingScheme(null)
    setFormData({
      subject: "",
      correctMarks: 4,
      incorrectMarks: -1,
      unattemptedMarks: 0,
      totalQuestions: 50,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Marking Schemes</CardTitle>
          <Button onClick={() => setIsCreating(true)} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Scheme
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingScheme ? "Edit Marking Scheme" : "Create New Marking Scheme"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g., Biology, Physics"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="totalQuestions">Total Questions</Label>
                  <Input
                    id="totalQuestions"
                    type="number"
                    value={formData.totalQuestions}
                    onChange={(e) => setFormData({ ...formData, totalQuestions: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="correctMarks">Correct Answer Marks</Label>
                  <Input
                    id="correctMarks"
                    type="number"
                    step="0.1"
                    value={formData.correctMarks}
                    onChange={(e) => setFormData({ ...formData, correctMarks: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="incorrectMarks">Incorrect Answer Marks</Label>
                  <Input
                    id="incorrectMarks"
                    type="number"
                    step="0.1"
                    value={formData.incorrectMarks}
                    onChange={(e) => setFormData({ ...formData, incorrectMarks: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="unattemptedMarks">Unattempted Marks</Label>
                  <Input
                    id="unattemptedMarks"
                    type="number"
                    step="0.1"
                    value={formData.unattemptedMarks}
                    onChange={(e) => setFormData({ ...formData, unattemptedMarks: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">Correct: +{formData.correctMarks}</span>
                  <span className="text-red-600">Incorrect: {formData.incorrectMarks}</span>
                  <span className="text-gray-600">Unattempted: {formData.unattemptedMarks}</span>
                  <span className="text-blue-600">Max Score: {formData.totalQuestions * formData.correctMarks}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveScheme} disabled={isLoading} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "Saving..." : editingScheme ? "Update" : "Create"}
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Schemes */}
        <div className="space-y-3">
          {schemes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No marking schemes configured for this exam.</p>
              <p className="text-sm">Add a marking scheme to enable proper score calculation.</p>
            </div>
          ) : (
            schemes.map((scheme) => (
              <Card key={scheme.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-medium">
                        {scheme.subject}
                      </Badge>
                      <div className="flex gap-3 text-sm">
                        <span className="text-green-600">+{scheme.correctMarks}</span>
                        <span className="text-red-600">{scheme.incorrectMarks}</span>
                        <span className="text-gray-600">{scheme.unattemptedMarks}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {scheme.totalQuestions} questions • Max: {scheme.totalMarks} marks
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEditScheme(scheme)} size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteScheme(scheme.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
