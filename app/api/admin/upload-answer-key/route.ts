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

    const { examDate, shift, subjectCombination, answerKeyData } = await request.json()

    if (!examDate || !shift || !subjectCombination || !answerKeyData) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Parse the answer key data
    const parsedAnswers = parseAnswerKey(answerKeyData)

    // Group by subject
    const subjectGroups = parsedAnswers.reduce(
      (acc, answer) => {
        if (!acc[answer.subject]) {
          acc[answer.subject] = []
        }
        acc[answer.subject].push({
          questionId: answer.questionId,
          correctOptions: answer.correctOptions,
          optionIds: answer.optionIds,
        })
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Create answer keys for each subject
    for (const [subject, answers] of Object.entries(subjectGroups)) {
      await prisma.answerKey.upsert({
        where: {
          examDate_shift_subjectCombination_subject: {
            examDate,
            shift,
            subjectCombination,
            subject,
          },
        },
        update: {
          answers,
          isApproved: true,
        },
        create: {
          examDate,
          shift,
          subjectCombination,
          subject,
          answers,
          isApproved: true,
          submittedBy: "admin",
        },
      })

      // Create default marking scheme if not exists
      await prisma.markingScheme.upsert({
        where: {
          examDate_shift_subjectCombination_subject: {
            examDate,
            shift,
            subjectCombination,
            subject,
          },
        },
        update: {},
        create: {
          examDate,
          shift,
          subjectCombination,
          subject,
          correctMarks: 5,
          incorrectMarks: -1,
          unattemptedMarks: 0,
          totalQuestions: 50,
          totalMarks: 250,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Answer key uploaded successfully",
    })
  } catch (error) {
    console.error("Upload answer key error:", error)
    return NextResponse.json({ success: false, error: "Failed to upload answer key" }, { status: 500 })
  }
}
