"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, AlertCircle, Settings, Mail } from "lucide-react"
import Link from "next/link"

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push("/admin/dashboard")
      }
    }
    checkSession()

    // Check for error in URL params
    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(getErrorMessage(errorParam))
    }
  }, [router, searchParams])

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "AccessDenied":
        return "Access denied. Your GitHub email might be private or not authorized for admin access."
      case "Configuration":
        return "Authentication configuration error. Please contact support."
      case "Verification":
        return "Email verification required. Please verify your GitHub email."
      default:
        return "Authentication failed. Please try again."
    }
  }

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("github", {
        callbackUrl: "/admin/dashboard",
        redirect: false,
      })

      if (result?.error) {
        setError(getErrorMessage(result.error))
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <p className="text-gray-600">Sign in with your authorized GitHub account</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full flex items-center gap-2"
              size="lg"
            >
              <Github className="h-5 w-5" />
              {isLoading ? "Signing in..." : "Sign in with GitHub"}
            </Button>

          </CardContent>
        </Card>

        {error && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <strong>Issue:</strong> Your GitHub email is private. We need access to your email to verify admin
                  access.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-3">
                  <h4 className="font-medium text-blue-800">Quick Fix:</h4>
                  <p className="text-sm text-gray-600">
                    Go to{" "}
                    <a
                      href="https://github.com/settings/emails"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      GitHub Email Settings
                    </a>{" "}
                    and uncheck "Keep my email addresses private"
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-3">
                  <h4 className="font-medium text-green-800">Alternative:</h4>
                  <p className="text-sm text-gray-600">
                    Use the{" "}
                    <Link href="/debug" className="text-green-600 underline">
                      debug panel
                    </Link>{" "}
                    to manually add your admin access
                  </p>
                </div>
              </div>

              {process.env.NODE_ENV === "development" && (
                <Link href="/debug">
                  <Button variant="outline" className="w-full">
                    Open Debug Panel
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
