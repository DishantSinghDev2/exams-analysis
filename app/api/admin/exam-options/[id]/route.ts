import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { isActive } = await request.json()

    const examOption = await prisma.examOption.update({
      where: { id: params.id },
      data: { isActive },
    })

    return NextResponse.json({
      success: true,
      examOption,
    })
  } catch (error) {
    console.error("Update exam option error:", error)
    return NextResponse.json({ success: false, error: "Failed to update exam option" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await prisma.examOption.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Exam option deleted successfully",
    })
  } catch (error) {
    console.error("Delete exam option error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete exam option" }, { status: 500 })
  }
}
