import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function formatAnswerKeyWithAI(rawAnswerKey: string): Promise<{
  success: boolean
  data?: Array<{ sno: string; questionId: string; answerId: string }>
  error?: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
You are an expert at parsing answer key data. I will provide you with raw answer key data in any format, and you need to extract and format it into a simple CSV structure.

TASK: Extract question IDs and their corresponding correct answer IDs from the provided data.

OUTPUT FORMAT: Return ONLY a JSON array with this exact structure:
[
  {"sno": "1", "questionId": "226895708423", "answerId": "2268952746780"},
  {"sno": "2", "questionId": "226895708424", "answerId": "2268952746784"}
]

RULES:
1. Extract only numeric question IDs and answer IDs
2. Remove any subject names, codes, or metadata
3. Generate sequential serial numbers starting from 1
4. Return ONLY the JSON array, no other text
5. If you can't find valid question/answer pairs, return an empty array []

RAW ANSWER KEY DATA:
${rawAnswerKey}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()

    // Try to parse the JSON response
    let parsedData
    try {
      // Remove any markdown code blocks if present
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim()
      parsedData = JSON.parse(cleanText)
    } catch (parseError) {
      console.error("Failed to parse AI response:", text)
      return {
        success: false,
        error: "AI returned invalid JSON format",
      }
    }

    // Validate the parsed data
    if (!Array.isArray(parsedData)) {
      return {
        success: false,
        error: "AI response is not an array",
      }
    }

    // Validate each item in the array
    const validatedData = parsedData.filter((item) => {
      return (
        item &&
        typeof item === "object" &&
        item.sno &&
        item.questionId &&
        item.answerId &&
        /^\d+$/.test(item.questionId) &&
        /^\d+$/.test(item.answerId)
      )
    })

    if (validatedData.length === 0) {
      return {
        success: false,
        error: "No valid question-answer pairs found in the data",
      }
    }

    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    return {
      success: false,
      error: "Failed to process answer key with AI",
    }
  }
}
