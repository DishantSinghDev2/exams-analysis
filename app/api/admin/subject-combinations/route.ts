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

    const { examShiftId, name, subjects } = await request.json()

    if (!examShiftId || !name || !subjects) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Check if subject combination already exists
    const existingCombination = await prisma.subjectCombination.findFirst({
      where: {
        examShiftId,
        name,
      },
    })
    if (existingCombination) {
      return NextResponse.json({ success: false, error: "Subject combination already exists for this exam shift" }, { status: 400 })
    }

    const subjectCombination = await prisma.subjectCombination.create({
      data: {
        examShiftId,
        name,
        subjects,
      },
    })

    return NextResponse.json({ success: true, subjectCombination })
  } catch (error) {
    console.error("Create subject combination error:", error)
    return NextResponse.json({ success: false, error: "Failed to create subject combination" }, { status: 500 })
  }
}
