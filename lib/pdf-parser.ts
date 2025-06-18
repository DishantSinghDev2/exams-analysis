export async function parsePDFResponse(file: File): Promise<any> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/parse-pdf", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to parse PDF")
    }

    const { text } = await response.json()

    // Use the same parser as HTML content
    const { parseResponseSheet } = await import("./parser")
    return await parseResponseSheet(text)
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
