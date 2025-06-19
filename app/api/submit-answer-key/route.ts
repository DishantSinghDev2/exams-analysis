import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { examName, examYear, examDate, shiftName, subjectCombination, answerKeyData } = await request.json()

    if (!examName || !examYear || !examDate || !shiftName || !answerKeyData) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }


    // Create pending answer key entries
      await prisma.pendingAnswerKey.create({
        data: {
          examName,
          examYear,
          examDate: new Date(examDate),
          shiftName,
          subjectCombination,
          answerKeyData,
          subject: "Get Subject Name", // Replace with actual subject name if available
          submittedBy: "student",
        },
      })

    return NextResponse.json({
      success: true,
      message: "Answer key submitted for approval",
    })
  } catch (error) {
    console.error("Submit answer key error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit answer key" }, { status: 500 })
  }
}
