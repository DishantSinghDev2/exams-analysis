import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseAnswerKey } from "@/lib/parser"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { keyId } = await request.json()

    if (!keyId) {
      return NextResponse.json({ success: false, error: "Missing key ID" }, { status: 400 })
    }

    // Get the pending key
    const pendingKey = await prisma.pendingAnswerKey.findUnique({
      where: { id: keyId },
    })

    if (!pendingKey) {
      return NextResponse.json({ success: false, error: "Pending key not found" }, { status: 404 })
    }

    // Parse the answer key data
    const parsedAnswers = parseAnswerKey(pendingKey.answerKeyData)

    // Filter answers for this subject
    const subjectAnswers = parsedAnswers
      .filter((answer) => answer.subject === pendingKey.subject)
      .map((answer) => ({
        questionId: answer.questionId,
        correctOptions: answer.correctOptions,
        optionIds: answer.optionIds,
      }))

    // Create the approved answer key
    await prisma.answerKey.upsert({
      where: {
        examDate_shift_subjectCombination_subject: {
          examDate: pendingKey.examDate,
          shift: pendingKey.shift,
          subjectCombination: pendingKey.subjectCombination,
          subject: pendingKey.subject,
        },
      },
      update: {
        answers: subjectAnswers,
        isApproved: true,
      },
      create: {
        examDate: pendingKey.examDate,
        shift: pendingKey.shift,
        subjectCombination: pendingKey.subjectCombination,
        subject: pendingKey.subject,
        answers: subjectAnswers,
        isApproved: true,
        submittedBy: pendingKey.submittedBy,
      },
    })

    // Create default marking scheme if not exists
    await prisma.markingScheme.upsert({
      where: {
        examDate_shift_subjectCombination_subject: {
          examDate: pendingKey.examDate,
          shift: pendingKey.shift,
          subjectCombination: pendingKey.subjectCombination,
          subject: pendingKey.subject,
        },
      },
      update: {},
      create: {
        examDate: pendingKey.examDate,
        shift: pendingKey.shift,
        subjectCombination: pendingKey.subjectCombination,
        subject: pendingKey.subject,
        correctMarks: 5,
        incorrectMarks: -1,
        unattemptedMarks: 0,
        totalQuestions: 50,
        totalMarks: 250,
      },
    })

    // Delete the pending key
    await prisma.pendingAnswerKey.delete({
      where: { id: keyId },
    })

    return NextResponse.json({
      success: true,
      message: "Answer key approved and saved",
    })
  } catch (error) {
    console.error("Approve key error:", error)
    return NextResponse.json({ success: false, error: "Failed to approve answer key" }, { status: 500 })
  }
}
