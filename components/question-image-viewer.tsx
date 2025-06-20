"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, RotateCcw, Loader } from "lucide-react";
import Tesseract from "tesseract.js"
import MarkdownRenderer from "./md-renderer";

interface QuestionImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  questionData: {
    questionId: string;
    questionNumber: string;
    imageUrl: string;
    selectedOption: string;
    correctOption: string;
    status: "Correct" | "Incorrect" | "Unattempted";
    subject: string;
  };
}

export default function QuestionImageViewer({ isOpen, onClose, questionData }: QuestionImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const fetchExplanation = async () => {
    setLoadingExplanation(true);
    setExplanation(null);
    try {
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(`https://cdn3.digialm.com${questionData.imageUrl}`)}`;
      const imageResponse = await fetch(proxyUrl)

      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch question image: ${imageResponse.statusText}`);
      }

      // Extract text from the image using Tesseract.js
      const imageBlob = await imageResponse.blob()
      const ocrResult = await Tesseract.recognize(imageBlob, "eng")
      const extractedText = ocrResult.data.text.trim()

      if (!extractedText) {
        return {
          success: false,
          error: "Failed to extract text from the question image",
        }
      }
      const response = await fetch("/api/explain-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedText,
          studentAnswer: questionData.selectedOption,
          correctAnswer: questionData.correctOption,
          subject: questionData.subject,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setExplanation(result.explanation);
      } else {
        setExplanation("Failed to fetch explanation. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setExplanation("An error occurred while fetching the explanation.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  // Scroll to the explanation section when the explanation is updated
  useEffect(() => {
    if (explanation) {
      const explanationElement = document.querySelector("#explanation");
      if (explanationElement) {
        explanationElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [explanation]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      onClose()
      setExplanation(null);
      setZoom(1);
      setRotation(0);}}>
      <DialogContent className="max-w-full max-h-screen overflow-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <DialogTitle className="flex items-center gap-2 flex-wrap">
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
        <div className="flex items-center justify-between border-b pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.5}>
              <ZoomOut className="h-4 w-4" />
              <span className="sr-only">Zoom Out</span>
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
              <ZoomIn className="h-4 w-4" />
              <span className="sr-only">Zoom In</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Rotate</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm flex-wrap">
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
          <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
            {imageLoading && <Loader className="h-6 w-6 text-gray-500" />}
            <img
              src={`https://cdn3.digialm.com${questionData.imageUrl}` || "/placeholder.svg"}
              alt={`Question ${questionData.questionNumber}`}
              className={`max-w-full max-h-full h-auto transition-transform duration-200 ease-in-out ${imageLoading ? "hidden" : "block"
                }`}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: "center",
              }}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg?height=400&width=600&text=Image+Not+Available";
                setImageLoading(false);
              }}
            />
          </div>
        </div>

        {/* AI Explanation */}
        <div className="border-t pt-4 mt-4"  id="explanation">
          <Button variant="default" size="sm" onClick={fetchExplanation} disabled={loadingExplanation}>
            {loadingExplanation ? <Loader className="animate-spin h-4 w-4" /> : "Get AI Explanation"}
          </Button>
          {explanation && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
              <strong>Explanation:</strong>
              <div className="mt-2">
                <MarkdownRenderer content={explanation} />
              
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}