"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push("/admin/dashboard")
      }
    }
    checkSession()
  }, [router])

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    try {
      await signIn("github", { callbackUrl: "/admin/dashboard" })
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <p className="text-gray-600">Sign in with your authorized GitHub account</p>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGitHubLogin} disabled={isLoading} className="w-full flex items-center gap-2" size="lg">
            <Github className="h-5 w-5" />
            {isLoading ? "Signing in..." : "Sign in with GitHub"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
