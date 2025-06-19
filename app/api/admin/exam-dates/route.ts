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

    const { examId, date } = await request.json()

    if (!examId || !date) {
      return NextResponse.json({ success: false, error: "Exam ID and date are required" }, { status: 400 })
    }

    // check if exam date already exists
    const existingExamDate = await prisma.examDate.findFirst({
      where: {
        examId,
        date: new Date(date),
      },
    })
    if (existingExamDate) {
      return NextResponse.json({ success: false, error: "Exam date already exists for this exam" }, { status: 400 })
    }

    const examDate = await prisma.examDate.create({
      data: {
        examId,
        date: new Date(date),
      },
    })

    return NextResponse.json({ success: true, examDate })
  } catch (error) {
    console.error("Create exam date error:", error)
    return NextResponse.json({ success: false, error: "Failed to create exam date" }, { status: 500 })
  }
}
