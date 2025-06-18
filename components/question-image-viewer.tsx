"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react"

interface QuestionImageViewerProps {
  isOpen: boolean
  onClose: () => void
  questionData: {
    questionId: string
    questionNumber: string
    imageUrl: string
    selectedOption: string
    correctOption: string
    status: "Correct" | "Incorrect" | "Unattempted"
    subject: string
  }
}

export default function QuestionImageViewer({ isOpen, onClose, questionData }: QuestionImageViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
  }
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Question {questionData.questionNumber}
              <Badge variant="outline">{questionData.subject}</Badge>
              <Badge
                variant={
                  questionData.status === "Correct"
                    ? "default"
                    : questionData.status === "Incorrect"
                      ? "destructive"
                      : "secondary"
                }
              >
                {questionData.status === "Correct" ? "✅" : questionData.status === "Incorrect" ? "❌" : "⚪"}{" "}
                {questionData.status}
              </Badge>
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Controls */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Your Answer:</span>
              <Badge variant={questionData.selectedOption ? "default" : "secondary"}>
                {questionData.selectedOption || "Not Attempted"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Correct Answer:</span>
              <Badge variant="outline">{questionData.correctOption}</Badge>
            </div>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-auto bg-gray-50 rounded-lg p-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <img
              src={`https://cdn3.digialm.com${questionData.imageUrl}` || "/placeholder.svg"}
              alt={`Question ${questionData.questionNumber}`}
              className="max-w-full h-auto transition-transform duration-200 ease-in-out"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=400&width=600&text=Image+Not+Available"
              }}
            />
          </div>
        </div>

        {/* Question Info */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Question ID:</span>
              <span className="ml-2 font-mono">{questionData.questionId}</span>
            </div>
            <div>
              <span className="font-medium">Subject:</span>
              <span className="ml-2">{questionData.subject}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
