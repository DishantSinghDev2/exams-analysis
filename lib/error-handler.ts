export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export const handleApiError = (error: unknown) => {
  console.error("API Error:", error)

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      statusCode: 500,
    }
  }

  return {
    success: false,
    error: "An unexpected error occurred",
    statusCode: 500,
  }
}

export const validateRequired = (fields: Record<string, any>, requiredFields: string[]) => {
  const missing = requiredFields.filter((field) => !fields[field])

  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(", ")}`, 400)
  }
}
