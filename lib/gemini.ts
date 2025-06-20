import { GoogleGenerativeAI } from "@google/generative-ai"
import Tesseract from "tesseract.js"

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
1. Extract only numeric question IDs and answer IDs, which are typically long integers and are just after the Subject name(with subject code like 101-ENGLISH then the next two long integers are probablly the questionId and answerId resp.).
2. Remove any subject names, codes, or metadata
3. Generate sequential serial numbers starting from 1
4. Return ONLY the JSON array, no other text
5. If you can't find valid question/answer pairs, then think creatively and try to extract them from the raw data.

RAW ANSWER KEY DATA:
${rawAnswerKey}
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()

    console.log("AI response:", text)

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

// Explaination of the questions (image of question will be fetched from its URL and then sent to Gemini for explanation) with student's selected answer and correct answer(makred as correct in the answer key)
export async function explainQuestionWithAI(
  extractedText: string,
  studentAnswer: string,
  correctAnswer: string,
  subject: string
): Promise<{
  success: boolean
  explanation?: string
  error?: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `
You are an expert at explaining exam questions and answers. I will provide you with a question, the student's selected answer, and the correct answer. Your task is to provide a clear and concise explanation of why the correct answer is correct and why the student's answer is incorrect. I will only provide you with the IDs of the answers to identify them, not the direct option number.

QUESTION: ${extractedText}
STUDENT'S ANSWER ID: ${studentAnswer}
CORRECT ANSWER ID: ${correctAnswer}
SUBJECT: ${subject}

NOTE: Do not include any answer IDs in your explanation. Focus on the content of the question and answers. The student's answer id and correct answer id are in sequence. If the correct answer is 2268952746819 (lets say acc to you its option 2) and the student's answer is 2268952746820 it means the student selected one option below the correct answer i.e. option 3, then correctly identify what opton student selected. 

EXPLANATION FORMAT: Provide a detailed explanation in simple language, suitable for a student who may not understand complex terminology. Focus on the key concepts and reasoning behind the correct answer.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()

    if (!text) {
      return {
        success: false,
        error: "AI did not provide any explanation",
      }
    }
    return {
      success: true,
      explanation: text,
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    return {
      success: false,
      error: "Failed to explain question with AI",
    }
  }
}