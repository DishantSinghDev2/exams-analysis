import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { examDate, shift, subjectCombination, answerKeyData } = await request.json()

    if (!examDate || !shift || !subjectCombination || !answerKeyData) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Parse subjects from answer key data
    const lines = answerKeyData.trim().split("\n")
    const subjects = new Set<string>()

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split("|").map((p: string) => p.trim())
      if (parts.length >= 2) {
        subjects.add(parts[1])
      }
    }

    // Create pending answer key entries for each subject
    for (const subject of subjects) {
      await prisma.pendingAnswerKey.create({
        data: {
          examDate,
          shift,
          subjectCombination,
          subject,
          answerKeyData,
          submittedBy: "student",
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Answer key submitted for approval",
    })
  } catch (error) {
    console.error("Submit answer key error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit answer key" }, { status: 500 })
  }
}
