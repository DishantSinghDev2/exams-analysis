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

    const exams = await prisma.exam.findMany({
      include: {
        examDates: {
          include: {
            examShifts: {
              include: {
                subjectCombinations: true,
              },
            },
          },
        },
      },
      orderBy: [{ year: "desc" }, { name: "asc" }],
    })

    return NextResponse.json({ success: true, exams })
  } catch (error) {
    console.error("Fetch admin exams error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch exams" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { name, year, description, hasSubjectCombinations } = await request.json()

    if (!name || !year) {
      return NextResponse.json({ success: false, error: "Name and year are required" }, { status: 400 })
    }

    // Check if exam already exists
    const existingExam = await prisma.exam.findFirst({
      where: {
        name,
        year,
      },
    })
    if (existingExam) {
      return NextResponse.json({ success: false, error: "This exam already exists" }, { status: 400 })
    }

    const exam = await prisma.exam.create({
      data: {
        name,
        year,
        description,
        hasSubjectCombinations: hasSubjectCombinations || false,
      },
    })

    return NextResponse.json({ success: true, exam })
  } catch (error) {
    console.error("Create exam error:", error)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ success: false, error: "This exam already exists" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to create exam" }, { status: 500 })
  }
}
