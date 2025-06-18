import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { formatAnswerKeyWithAI } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { rawAnswerKey } = await request.json()

    if (!rawAnswerKey || typeof rawAnswerKey !== "string" || !rawAnswerKey.trim()) {
      return NextResponse.json({ success: false, error: "Raw answer key data is required" }, { status: 400 })
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "AI formatting is not configured. Please set GEMINI_API_KEY." },
        { status: 500 },
      )
    }

    const result = await formatAnswerKeyWithAI(rawAnswerKey)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully formatted ${result.data?.length || 0} answer entries`,
      formattedData: result.data,
    })
  } catch (error) {
    console.error("Format answer key error:", error)
    return NextResponse.json({ success: false, error: "Failed to format answer key" }, { status: 500 })
  }
}
