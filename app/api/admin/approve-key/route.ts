import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseAnswerKey } from "@/lib/parser"

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

    // Get the pending key
    const pendingKey = await prisma.pendingAnswerKey.findUnique({
      where: { id: keyId },
    })

    if (!pendingKey) {
      return NextResponse.json({ success: false, error: "Pending key not found" }, { status: 404 })
    }

    // Delete the pending key
    await prisma.pendingAnswerKey.delete({
      where: { id: keyId },
    })

    return NextResponse.json({
      success: true,
      message: "Answer key approved and saved",
    })
  } catch (error) {
    console.error("Approve key error:", error)
    return NextResponse.json({ success: false, error: "Failed to approve answer key" }, { status: 500 })
  }
}
