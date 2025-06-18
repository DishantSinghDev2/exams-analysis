import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Access token required" }, { status: 400 })
    }

    // Fetch user profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "ExamAnalyzer",
      },
    })

    // Fetch user emails
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "ExamAnalyzer",
      },
    })

    const user = userResponse.ok ? await userResponse.json() : null
    const emails = emailsResponse.ok ? await emailsResponse.json() : []

    return NextResponse.json({
      success: true,
      user,
      emails,
    })
  } catch (error) {
    console.error("GitHub emails fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch GitHub data" }, { status: 500 })
  }
}
