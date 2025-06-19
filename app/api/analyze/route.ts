import { type NextRequest, NextResponse } from "next/server"
import { parseResponseSheet } from "@/lib/parser"
import { analyzeResponse } from "@/lib/analysis"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { examName, examYear, examDate, shiftName, subjectCombination, responseInput } = await request.json()

    if (!examName || !examYear || !examDate || !shiftName || !responseInput) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Parse the response sheet
    const parsedData = await parseResponseSheet(responseInput)

    // Store the student response
    const studentResponse = await prisma.studentResponse.create({
      data: {
        examName,
        examYear,
        examDate: new Date(examDate),
        shiftName,
        subjectCombination,
        applicationNo: parsedData.applicationNo,
        candidateName: parsedData.candidateName,
        rollNo: parsedData.rollNo,
        responses: JSON.stringify(parsedData.responses),
      },
    })

    // Try to analyze with existing answer keys
    const analysis = await analyzeResponse(
      examName,
      examYear,
      new Date(examDate),
      shiftName,
      subjectCombination,
      parsedData.responses,
    )

    if (analysis) {
      // Update the student response with analysis
      await prisma.studentResponse.update({
        where: { id: studentResponse.id },
        data: { analysisResult: JSON.stringify(analysis) },
      })

      return NextResponse.json({
        success: true,
        analysis,
        studentData: {
          applicationNo: parsedData.applicationNo,
          candidateName: parsedData.candidateName,
          rollNo: parsedData.rollNo,
        },
      })
    } else {
      return NextResponse.json({
        success: true,
        analysis: null,
        message: "Answer key not available",
      })
    }
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 },
    )
  }
}
