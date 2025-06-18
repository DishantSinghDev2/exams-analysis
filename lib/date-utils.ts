export function formatExamDate(date: Date): string {
    const day = date.getDate()
    const month = date.toLocaleDateString("en-US", { month: "long" })
    const year = date.getFullYear()
  
    const suffix = getDaySuffix(day)
    return `${day}${suffix} ${month} ${year}`
  }
  
  export function getDaySuffix(day: number): string {
    if (day >= 11 && day <= 13) {
      return "th"
    }
    switch (day % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }
  
  export function parseExamDate(dateString: string): Date {
    // Handle various date formats
    if (dateString.includes("/")) {
      // Format: DD/MM/YYYY
      const [day, month, year] = dateString.split("/")
      return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
    }
    return new Date(dateString)
  }
  