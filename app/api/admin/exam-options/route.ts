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

    const examOptions = await prisma.examOption.findMany({
      orderBy: [{ examDate: "desc" }, { shift: "asc" }, { subjectCombination: "asc" }],
    })

    return NextResponse.json({
      success: true,
      examOptions,
    })
  } catch (error) {
    console.error("Fetch admin exam options error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch exam options" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { examDate, shift, subjectCombination, examName } = await request.json()

    if (!examDate || !shift || !subjectCombination || !examName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const examOption = await prisma.examOption.create({
      data: {
        examDate,
        shift,
        subjectCombination,
        examName,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      examOption,
    })
  } catch (error) {
    console.error("Create exam option error:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ success: false, error: "This exam option already exists" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to create exam option" }, { status: 500 })
  }
}
