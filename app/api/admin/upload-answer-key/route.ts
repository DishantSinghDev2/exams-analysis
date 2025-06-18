import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseAnswerKey, validateAnswerKeyFormat } from "@/lib/parser"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { examName, examYear, examDate, shiftName, subjectCombination, answerKeyData } = await request.json()

    if (!examName || !examYear || !examDate || !shiftName || !answerKeyData) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate answer key format
    const validation = validateAnswerKeyFormat(answerKeyData)
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }

    // Parse the answer key data
    const parsedAnswers = parseAnswerKey(answerKeyData)

    if (parsedAnswers.length === 0) {
      return NextResponse.json({ success: false, error: "No valid answer key entries found" }, { status: 400 })
    }

    // Group by subject
    const subjectGroups = parsedAnswers.reduce(
      (acc, answer) => {
        if (!acc[answer.subject]) {
          acc[answer.subject] = []
        }
        acc[answer.subject].push({
          questionId: answer.questionId,
          correctAnswerId: answer.correctAnswerId,
        })
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Create answer keys for each subject
    for (const [subject, answers] of Object.entries(subjectGroups)) {
      await prisma.answerKey.upsert({
        where: {
          examName_examYear_examDate_shiftName_subjectCombination_subject: {
            examName,
            examYear,
            examDate,
            shiftName,
            subjectCombination: subjectCombination || "",
            subject,
          },
        },
        update: {
          answers,
          isApproved: true,
        },
        create: {
          examName,
          examYear,
          examDate,
          shiftName,
          subjectCombination: subjectCombination || "",
          subject,
          answers,
          isApproved: true,
          submittedBy: "admin",
        },
      })

      // Create default marking scheme if not exists
      await prisma.markingScheme.upsert({
        where: {
          examName_examYear_examDate_shiftName_subjectCombination_subject: {
            examName,
            examYear,
            examDate,
            shiftName,
            subjectCombination: subjectCombination || "",
            subject,
          },
        },
        update: {},
        create: {
          examName,
          examYear,
          examDate,
          shiftName,
          subjectCombination: subjectCombination || "",
          subject,
          correctMarks: 4,
          incorrectMarks: -1,
          unattemptedMarks: 0,
          totalQuestions: 50,
          totalMarks: 200,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Answer key uploaded successfully for ${Object.keys(subjectGroups).length} subject(s)`,
      subjects: Object.keys(subjectGroups),
    })
  } catch (error) {
    console.error("Upload answer key error:", error)
    return NextResponse.json({ success: false, error: "Failed to upload answer key" }, { status: 500 })
  }
}
