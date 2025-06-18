import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await prisma.markingScheme.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Marking scheme deleted successfully",
    })
  } catch (error) {
    console.error("Delete marking scheme error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete marking scheme" }, { status: 500 })
  }
}
