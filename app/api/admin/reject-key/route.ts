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

    const { keyId } = await request.json()

    if (!keyId) {
      return NextResponse.json({ success: false, error: "Missing key ID" }, { status: 400 })
    }

    // Delete the pending key
    await prisma.pendingAnswerKey.delete({
      where: { id: keyId },
    })

    return NextResponse.json({
      success: true,
      message: "Answer key rejected",
    })
  } catch (error) {
    console.error("Reject key error:", error)
    return NextResponse.json({ success: false, error: "Failed to reject answer key" }, { status: 500 })
  }
}
