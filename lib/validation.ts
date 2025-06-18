export const validateExamDate = (date: string): boolean => {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
  return dateRegex.test(date)
}

export const validateShift = (shift: string): boolean => {
  return shift.length > 0 && shift.length <= 50
}

export const validateSubjectCombination = (combination: string): boolean => {
  const validCombinations = ["Combination 1", "Combination 2", "Combination 3", "Combination 4"]
  return validCombinations.includes(combination)
}

export const validateAnswerKeyFormat = (answerKeyData: string): boolean => {
  const lines = answerKeyData.trim().split("\n")

  if (lines.length < 2) return false

  // Check header
  const header = lines[0].toLowerCase()
  if (!header.includes("sno") || !header.includes("subject") || !header.includes("questionid")) {
    return false
  }

  // Check data lines
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split("|")
    if (parts.length < 4) return false
  }

  return true
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "")
}
