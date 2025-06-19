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

    const { examDateId, shiftName, startTime, endTime } = await request.json()

    if (!examDateId || !shiftName) {
      return NextResponse.json({ success: false, error: "Exam date ID and shift name are required" }, { status: 400 })
    }

    // check if exam shift already exists
    const existingShift = await prisma.examShift.findFirst({
      where: {
        examDateId,
        shiftName,
      },
    })
    if (existingShift) {
      return NextResponse.json({ success: false, error: "Exam shift already exists for this exam date" }, { status: 400 })
    }

    const examShift = await prisma.examShift.create({
      data: {
        examDateId,
        shiftName,
        startTime,
        endTime,
      },
    })

    return NextResponse.json({ success: true, examShift })
  } catch (error) {
    console.error("Create exam shift error:", error)
    return NextResponse.json({ success: false, error: "Failed to create exam shift" }, { status: 500 })
  }
}
