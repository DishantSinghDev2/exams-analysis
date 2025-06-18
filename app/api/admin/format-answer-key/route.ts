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

    if (!rawAnswerKey || rawAnswerKey.trim().length === 0) {
      return NextResponse.json({ success: false, error: "No answer key data provided" }, { status: 400 })
    }

    const result = await formatAnswerKeyWithAI(rawAnswerKey)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      formattedData: result.formattedData,
      message: `Successfully formatted ${result.formattedData?.length} answer entries`,
    })
  } catch (error) {
    console.error("Format answer key error:", error)
    return NextResponse.json({ success: false, error: "Failed to format answer key" }, { status: 500 })
  }
}
