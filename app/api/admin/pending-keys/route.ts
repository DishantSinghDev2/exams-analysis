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

    const pendingKeys = await prisma.pendingAnswerKey.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      pendingKeys,
    })
  } catch (error) {
    console.error("Fetch pending keys error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch pending keys" }, { status: 500 })
  }
}
