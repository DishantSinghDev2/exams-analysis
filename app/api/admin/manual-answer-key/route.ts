import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { examName, examYear, examDate, shiftName, subjectCombination, subject, answers } = await request.json()

    if (!examName || !examYear || !examDate || !shiftName || !subject || !answers || answers.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate answers format
    for (const answer of answers) {
      if (!answer.questionId || !answer.correctAnswerId) {
        return NextResponse.json(
          { success: false, error: "Each answer must have questionId and correctAnswerId" },
          { status: 400 },
        )
      }
    }

    // Create or update answer key
    await prisma.answerKey.upsert({
      where: {
        examName_examYear_examDate_shiftName_subjectCombination_subject: {
          examName,
          examYear,
          examDate: new Date(examDate),
          shiftName,
          subjectCombination: subjectCombination || null,
          subject,
        },
      },
      update: {
        answers,
        isApproved: true,
        updatedAt: new Date(),
      },
      create: {
        examName,
        examYear,
        examDate: new Date(examDate),
        shiftName,
        subjectCombination: subjectCombination || null,
        subject,
        answers,
        isApproved: true,
        submittedBy: "admin",
      },
    })

    // Create or update default marking scheme
    await prisma.markingScheme.upsert({
      where: {
        examName_examYear_examDate_shiftName_subjectCombination_subject: {
          examName,
          examYear,
          examDate: new Date(examDate),
          shiftName,
          subjectCombination: subjectCombination || null,
          subject,
        },
      },
      update: {
        totalQuestions: answers.length,
        totalMarks: answers.length * 4,
      },
      create: {
        examName,
        examYear,
        examDate: new Date(examDate),
        shiftName,
        subjectCombination: subjectCombination || null,
        subject,
        correctMarks: 4,
        incorrectMarks: -1,
        unattemptedMarks: 0,
        totalQuestions: answers.length,
        totalMarks: answers.length * 4,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Manual answer key saved successfully for ${subject}`,
    })
  } catch (error) {
    console.error("Manual answer key error:", error)
    return NextResponse.json({ success: false, error: "Failed to save manual answer key" }, { status: 500 })
  }
}
