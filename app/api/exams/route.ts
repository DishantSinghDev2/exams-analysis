import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatExamDate } from "@/lib/date-utils"

export async function GET(request: NextRequest) {
  try {
    const exams = await prisma.exam.findMany({
      where: { isActive: true },
      include: {
        examDates: {
          where: { isActive: true },
          include: {
            examShifts: {
              where: { isActive: true },
              include: {
                subjectCombinations: {
                  where: { isActive: true },
                },
              },
            },
          },
          orderBy: { date: "asc" },
        },
      },
      orderBy: [{ year: "desc" }, { name: "asc" }],
    })

    // Transform the data for easier frontend consumption
    const transformedExams = exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
      year: exam.year,
      description: exam.description,
      hasSubjectCombinations: exam.hasSubjectCombinations,
      displayName: `${exam.name} ${exam.year}`,
      dates: exam.examDates.map((examDate) => ({
        id: examDate.id,
        date: examDate.date,
        formattedDate: formatExamDate(examDate.date),
        shifts: examDate.examShifts.map((shift) => ({
          id: shift.id,
          name: shift.shiftName,
          startTime: shift.startTime,
          endTime: shift.endTime,
          combinations: shift.subjectCombinations.map((combo) => ({
            id: combo.id,
            name: combo.name,
            subjects: combo.subjects as string[],
          })),
        })),
      })),
    }))

    return NextResponse.json({
      success: true,
      exams: transformedExams,
    })
  } catch (error) {
    console.error("Fetch exams error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch exams" }, { status: 500 })
  }
}
