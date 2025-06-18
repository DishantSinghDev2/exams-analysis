interface ParsedResponse {
  questionId: string
  chosenOption: string
  status: "Answered" | "Not Answered"
  subject: string
}

interface ParsedData {
  applicationNo: string
  candidateName: string
  rollNo: string
  testDate: string
  testTime: string
  subject: string
  responses: ParsedResponse[]
}

export async function parseResponseSheet(input: string): Promise<ParsedData> {
  let content = input

  // If it's a URL, fetch the content
  if (input.startsWith("http")) {
    try {
      const response = await fetch(input)
      content = await response.text()
    } catch (error) {
      throw new Error("Failed to fetch response sheet from URL")
    }
  }

  // Parse HTML content
  const applicationNoMatch = content.match(/Application No\s*(\d+)/)
  const candidateNameMatch = content.match(/Candidate Name\s*([^\n\r]+)/)
  const rollNoMatch = content.match(/Roll No\.\s*([^\n\r]+)/)
  const testDateMatch = content.match(/Test Date\s*([^\n\r]+)/)
  const testTimeMatch = content.match(/Test Time\s*([^\n\r]+)/)
  const subjectMatch = content.match(/Subject\s*([^\n\r]+)/)

  if (!applicationNoMatch || !candidateNameMatch || !rollNoMatch) {
    throw new Error("Invalid response sheet format")
  }

  const responses: ParsedResponse[] = []

  // Extract questions and answers
  const questionRegex =
    /Q\.(\d+)[\s\S]*?Question ID\s*:\s*(\d+)[\s\S]*?Status\s*:\s*(Answered|Not Answered)[\s\S]*?(?:Chosen Option\s*:\s*(\d+))?/g
  const sectionRegex = /Section\s*:\s*([^\n\r]+)/g

  let currentSection = "Unknown"
  let sectionMatch
  let questionMatch

  // Find all sections
  const sections: { name: string; position: number }[] = []
  while ((sectionMatch = sectionRegex.exec(content)) !== null) {
    sections.push({
      name: sectionMatch[1].trim(),
      position: sectionMatch.index,
    })
  }

  // Parse questions
  while ((questionMatch = questionRegex.exec(content)) !== null) {
    const questionPosition = questionMatch.index

    // Find which section this question belongs to
    for (let i = sections.length - 1; i >= 0; i--) {
      if (questionPosition > sections[i].position) {
        currentSection = sections[i].name
        break
      }
    }

    responses.push({
      questionId: questionMatch[2],
      chosenOption: questionMatch[4] || "",
      status: questionMatch[3] as "Answered" | "Not Answered",
      subject: currentSection,
    })
  }

  return {
    applicationNo: applicationNoMatch[1],
    candidateName: candidateNameMatch[1].trim(),
    rollNo: rollNoMatch[1].trim(),
    testDate: testDateMatch?.[1]?.trim() || "",
    testTime: testTimeMatch?.[1]?.trim() || "",
    subject: subjectMatch?.[1]?.trim() || "",
    responses,
  }
}

// Updated parser for new tab-separated format
export function parseAnswerKey(answerKeyText: string): Array<{
  sno: string
  subject: string
  questionId: string
  correctAnswerId: string
}> {
  const lines = answerKeyText.trim().split("\n")
  const answers = []

  for (let i = 1; i < lines.length; i++) {
    // Skip header and empty lines
    const line = lines[i].trim()
    if (!line) continue

    // Split by tab or multiple spaces/pipes
    const parts = line
      .split(/\t+|\s{2,}|\|/)
      .map((p) => p.trim())
      .filter((p) => p)

    if (parts.length >= 4) {
      // Extract subject name (remove code prefix if present)
      let subject = parts[1]
      if (subject.includes("-")) {
        subject = subject.split("-")[1].split("/")[0].trim()
      }

      answers.push({
        sno: parts[0],
        subject: subject,
        questionId: parts[2],
        correctAnswerId: parts[3], // This is the correct answer ID
      })
    }
  }

  return answers
}

// Validate the new answer key format
export function validateAnswerKeyFormat(answerKeyData: string): { isValid: boolean; error?: string } {
  const lines = answerKeyData.trim().split("\n")

  if (lines.length < 2) {
    return { isValid: false, error: "Answer key must have at least a header and one data row" }
  }

  // Check header
  const header = lines[0].toLowerCase()
  if (!header.includes("sno") || !header.includes("subject") || !header.includes("questionid")) {
    return { isValid: false, error: "Header must contain 'Sno', 'Subject', and 'QuestionID' columns" }
  }

  // Check data lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    const parts = line
      .split(/\t+|\s{2,}|\|/)
      .map((p) => p.trim())
      .filter((p) => p)
    if (parts.length < 4) {
      return {
        isValid: false,
        error: `Row ${i + 1} must have at least 4 columns (Sno, Subject, QuestionID, Correct Answer ID)`,
      }
    }

    // Validate question ID is numeric
    if (!/^\d+$/.test(parts[2])) {
      return { isValid: false, error: `Row ${i + 1}: Question ID must be numeric` }
    }

    // Validate answer ID is numeric
    if (!/^\d+$/.test(parts[3])) {
      return { isValid: false, error: `Row ${i + 1}: Answer ID must be numeric` }
    }
  }

  return { isValid: true }
}
