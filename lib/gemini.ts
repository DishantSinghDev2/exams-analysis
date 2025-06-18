import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function formatAnswerKeyWithAI(rawAnswerKey: string): Promise<{
  success: boolean
  formattedData?: Array<{ sno: string; questionId: string; answerId: string }>
  error?: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
You are an AI assistant that formats answer keys. Please convert the following answer key data into a simple CSV format with exactly 3 columns: Sno, QuestionID, AnswerID.

Rules:
1. Extract only the serial number, question ID, and the correct answer ID
2. Ignore subject names, option lists, and other metadata
3. Return ONLY the CSV data with headers
4. Use comma separation
5. Each row should have exactly 3 values
6. Question IDs and Answer IDs should be numeric
7. If multiple correct answers exist, create separate rows for each

Input data:
${rawAnswerKey}

Expected output format:
1,226895708423,2268952746780
2,226895708424,2268952746784

Please format the data now:
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the AI response
    const lines = text.trim().split("\n")
    if (lines.length < 2) {
      return { success: false, error: "AI could not format the data properly" }
    }

    // Skip header and parse data
    const formattedData = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const parts = line.split(",").map((p) => p.trim())
      if (parts.length >= 3) {
        formattedData.push({
          sno: parts[0],
          questionId: parts[1],
          answerId: parts[2],
        })
      }
    }

    if (formattedData.length === 0) {
      return { success: false, error: "No valid data found after AI formatting" }
    }

    return { success: true, formattedData }
  } catch (error) {
    console.error("Gemini API error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to format with AI",
    }
  }
}
