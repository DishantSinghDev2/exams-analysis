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

    // Get statistics
    const [totalResponses, totalAnswerKeys, pendingKeys, recentResponses] = await Promise.all([
      prisma.studentResponse.count(),
      prisma.answerKey.count({ where: { isApproved: true } }),
      prisma.pendingAnswerKey.count(),
      prisma.studentResponse.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          candidateName: true,
          examDate: true,
          shift: true,
          subjectCombination: true,
          createdAt: true,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalResponses,
        totalAnswerKeys,
        pendingKeys,
        recentResponses,
      },
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 })
  }
}
