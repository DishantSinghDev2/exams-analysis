import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ success: false, error: "File must be a PDF" }, { status: 400 })
    }

    // Convert PDF to text using pdf-parse
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let text = ""
    try {
      // Import pdf-parse dynamically
      const pdfParse = (await import("pdf-parse")).default
      const data = await pdfParse(buffer)
      text = data.text

      if (!text || text.length < 100) {
        throw new Error("Could not extract sufficient text from PDF")
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to extract text from PDF. Please try pasting the content directly.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      text: text,
    })
  } catch (error) {
    console.error("PDF parsing error:", error)
    return NextResponse.json({ success: false, error: "Failed to parse PDF" }, { status: 500 })
  }
}
