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

export function parseAnswerKey(answerKeyText: string): Array<{
  sno: string
  subject: string
  questionId: string
  correctOptions: string[]
  optionIds: string[]
}> {
  const lines = answerKeyText.trim().split("\n")
  const answers = []

  for (let i = 1; i < lines.length; i++) {
    // Skip header
    const parts = lines[i].split("|").map((p) => p.trim())
    if (parts.length >= 5) {
      answers.push({
        sno: parts[0],
        subject: parts[1],
        questionId: parts[2],
        correctOptions: parts[3].split(",").map((o) => o.trim()),
        optionIds: parts[4].split(",").map((o) => o.trim()),
      })
    }
  }

  return answers
}
