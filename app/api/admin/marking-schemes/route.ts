import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const examName = searchParams.get("examName")
    const examYear = searchParams.get("examYear")
    const examDate = searchParams.get("examDate")
    const shiftName = searchParams.get("shiftName")
    const subjectCombination = searchParams.get("subjectCombination")

    if (!examName || !examYear || !examDate || !shiftName) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    const schemes = await prisma.markingScheme.findMany({
      where: {
        examName,
        examYear,
        examDate: new Date(examDate),
        shiftName,
        subjectCombination: subjectCombination || null,
      },
      orderBy: { subject: "asc" },
    })

    return NextResponse.json({
      success: true,
      schemes,
    })
  } catch (error) {
    console.error("Get marking schemes error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch marking schemes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const {
      examName,
      examYear,
      examDate,
      shiftName,
      subjectCombination,
      subject,
      correctMarks,
      incorrectMarks,
      unattemptedMarks,
      totalQuestions,
      totalMarks,
    } = await request.json()

    const scheme = await prisma.markingScheme.upsert({
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
        correctMarks,
        incorrectMarks,
        unattemptedMarks,
        totalQuestions,
        totalMarks,
      },
      create: {
        examName,
        examYear,
        examDate: new Date(examDate),
        shiftName,
        subjectCombination: subjectCombination || null,
        subject,
        correctMarks,
        incorrectMarks,
        unattemptedMarks,
        totalQuestions,
        totalMarks,
      },
    })

    return NextResponse.json({
      success: true,
      scheme,
      message: "Marking scheme saved successfully",
    })
  } catch (error) {
    console.error("Create marking scheme error:", error)
    return NextResponse.json({ success: false, error: "Failed to create marking scheme" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const {
      id,
      examName,
      examYear,
      examDate,
      shiftName,
      subjectCombination,
      subject,
      correctMarks,
      incorrectMarks,
      unattemptedMarks,
      totalQuestions,
      totalMarks,
    } = await request.json()

    const scheme = await prisma.markingScheme.update({
      where: { id },
      data: {
        examName,
        examYear,
        examDate: new Date(examDate),
        shiftName,
        subjectCombination: subjectCombination || null,
        subject,
        correctMarks,
        incorrectMarks,
        unattemptedMarks,
        totalQuestions,
        totalMarks,
      },
    })

    return NextResponse.json({
      success: true,
      scheme,
      message: "Marking scheme updated successfully",
    })
  } catch (error) {
    console.error("Update marking scheme error:", error)
    return NextResponse.json({ success: false, error: "Failed to update marking scheme" }, { status: 500 })
  }
}
