import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // For debugging purposes, allow this endpoint in development
    if (process.env.NODE_ENV !== "development") {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
      }
    }

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        githubId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      admins,
    })
  } catch (error) {
    console.error("Manage admins error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch admins" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // For debugging purposes, allow this endpoint in development
    if (process.env.NODE_ENV !== "development") {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
      }
    }

    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const admin = await prisma.admin.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name: name || "Admin User",
        githubId: "",
      },
    })

    return NextResponse.json({
      success: true,
      admin,
    })
  } catch (error) {
    console.error("Create admin error:", error)
    return NextResponse.json({ success: false, error: "Failed to create admin" }, { status: 500 })
  }
}
