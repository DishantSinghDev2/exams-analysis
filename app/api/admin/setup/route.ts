import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ success: false, error: "Only available in development" }, { status: 403 })
    }

    const { email, name, githubId } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const admin = await prisma.admin.upsert({
      where: { email },
      update: {
        name: name || "Admin User",
        githubId: githubId || "",
      },
      create: {
        email,
        name: name || "Admin User",
        githubId: githubId || "",
      },
    })

    return NextResponse.json({
      success: true,
      admin,
      message: "Admin setup completed",
    })
  } catch (error) {
    console.error("Admin setup error:", error)
    return NextResponse.json({ success: false, error: "Failed to setup admin" }, { status: 500 })
  }
}
