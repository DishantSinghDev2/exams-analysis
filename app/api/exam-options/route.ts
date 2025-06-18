import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const examOptions = await prisma.examOption.findMany({
      where: { isActive: true },
      orderBy: [{ examDate: "desc" }, { shift: "asc" }, { subjectCombination: "asc" }],
    })

    // Group by exam date for better organization
    const groupedOptions = examOptions.reduce(
      (acc, option) => {
        if (!acc[option.examDate]) {
          acc[option.examDate] = {
            examDate: option.examDate,
            examName: option.examName,
            shifts: [],
          }
        }

        const existingShift = acc[option.examDate].shifts.find((s: any) => s.shift === option.shift)
        if (existingShift) {
          existingShift.subjectCombinations.push(option.subjectCombination)
        } else {
          acc[option.examDate].shifts.push({
            shift: option.shift,
            subjectCombinations: [option.subjectCombination],
          })
        }

        return acc
      },
      {} as Record<string, any>,
    )

    return NextResponse.json({
      success: true,
      examOptions: Object.values(groupedOptions),
    })
  } catch (error) {
    console.error("Fetch exam options error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch exam options" }, { status: 500 })
  }
}
