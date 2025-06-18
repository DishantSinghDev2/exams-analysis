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

  // Check if it's HTML content
  if (content.includes("<body") || content.includes("<table")) {
    return parseHTMLResponseSheet(content)
  } else {
    return parseTextResponseSheet(content)
  }
}

function parseHTMLResponseSheet(content: string): ParsedData {
  // Extract basic information from the HTML table
  const applicationNoMatch = content.match(/<td>Application No<\/td>\s*<td>(\d+)<\/td>/)
  const candidateNameMatch = content.match(/<td>Candidate Name<\/td>\s*<td>([^<]+)<\/td>/)
  const rollNoMatch = content.match(/<td>Roll No\.<\/td>\s*<td>([^<]+)<\/td>/)
  const testDateMatch = content.match(/<td>Test Date<\/td>\s*<td>([^<]+)<\/td>/)
  const testTimeMatch = content.match(/<td>Test Time<\/td>\s*<td>([^<]+)<\/td>/)
  const subjectMatch = content.match(/<td>Subject<\/td>\s*<td>([^<]+)<\/td>/)

  if (!applicationNoMatch || !candidateNameMatch || !rollNoMatch) {
    throw new Error("Invalid response sheet format - missing required student information")
  }

  const responses: ParsedResponse[] = []

  // Extract section information
  const sectionMatches = content.matchAll(/<span class="bold">([^<]+)<\/span><\/div>/g)
  const sections = Array.from(sectionMatches).map((match) => match[1])

  // Extract questions from each question panel
  const questionPanels = content.matchAll(
    /<div class="question-pnl"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="question-pnl"|<\/div>\s*<\/div>)/g,
  )

  const currentSection = sections[0] || "Unknown"
  const sectionIndex = 0

  for (const panel of questionPanels) {
    const panelContent = panel[1]

    // Extract question information
    const questionIdMatch = panelContent.match(/<td align="right">Question ID :<\/td>\s*<td class="bold">(\d+)<\/td>/)
    const statusMatch = panelContent.match(
      /<td align="right">Status :<\/td>\s*<td class="bold">(Answered|Not Answered)<\/td>/,
    )
    const chosenOptionMatch = panelContent.match(
      /<td align="right">Chosen Option :<\/td>\s*<td class="bold">(\d+)<\/td>/,
    )

    // Extract option IDs to map chosen option number to option ID
    const optionIds: string[] = []
    const optionMatches = panelContent.matchAll(
      /<td align="right">Option (\d+) ID :<\/td>\s*<td class="bold">(\d+)<\/td>/g,
    )

    for (const optionMatch of optionMatches) {
      const optionNumber = Number.parseInt(optionMatch[1])
      const optionId = optionMatch[2]
      optionIds[optionNumber - 1] = optionId // Convert to 0-based index
    }

    if (questionIdMatch && statusMatch) {
      let chosenOptionId = ""

      if (chosenOptionMatch && statusMatch[1] === "Answered") {
        const chosenOptionNumber = Number.parseInt(chosenOptionMatch[1])
        chosenOptionId = optionIds[chosenOptionNumber - 1] || chosenOptionMatch[1]
      }

      responses.push({
        questionId: questionIdMatch[1],
        chosenOption: chosenOptionId,
        status: statusMatch[1] as "Answered" | "Not Answered",
        subject: currentSection,
      })
    }
  }

  // If we have multiple sections, try to distribute questions accordingly
  if (sections.length > 1) {
    const questionsPerSection = Math.ceil(responses.length / sections.length)
    responses.forEach((response, index) => {
      const sectionIndex = Math.floor(index / questionsPerSection)
      if (sections[sectionIndex]) {
        response.subject = sections[sectionIndex]
      }
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

function parseTextResponseSheet(content: string): ParsedData {
  // Original text-based parsing logic
  const applicationNoMatch = content.match(/Application No\s*(\d+)/)
  const candidateNameMatch = content.match(/Candidate Name\s*([^\n\r]+)/)
  const rollNoMatch = content.match(/Roll No\.\s*([^\n\r]+)/)
  const testDateMatch = content.match(/Test Date\s*([^\n\r]+)/)
  const testTimeMatch = content.match(/Test Time\s*([^\n\r]+)/)
  const subjectMatch = content.match(/Subject\s*([^\n\r]+)/)

  if (!applicationNoMatch || !candidateNameMatch || !rollNoMatch) {
    throw new Error("Invalid response sheet format - missing required student information")
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
