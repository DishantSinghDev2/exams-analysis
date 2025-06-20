"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Info, Plus, User, Github, Mail, AlertTriangle } from "lucide-react"

interface Admin {
  id: string
  email: string
  name: string
  githubId: string
  createdAt: string
  updatedAt: string
}

export default function AdminDebug() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [newGithubId, setNewGithubId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [githubToken, setGithubToken] = useState("")
  const [githubData, setGithubData] = useState<any>(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin/manage-admins")
      const data = await response.json()
      if (data.success) {
        setAdmins(data.admins)
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error)
    }
  }

  const handleAddAdmin = async () => {
    if (!newEmail) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          name: newName,
          githubId: newGithubId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setNewEmail("")
        setNewName("")
        setNewGithubId("")
        fetchAdmins()
      }
    } catch (error) {
      console.error("Failed to add admin:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchGithubEmails = async () => {
    if (!githubToken) return

    try {
      const response = await fetch("/api/admin/github-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: githubToken }),
      })

      const data = await response.json()
      if (data.success) {
        setGithubData(data)
      }
    } catch (error) {
      console.error("Failed to fetch GitHub data:", error)
    }
  }

  if (process.env.NODE_ENV === "production") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p>This page is only available in development mode.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Debug Panel</h1>
          <p className="text-gray-600">Development only - Manage admin users and debug GitHub issues</p>
        </div>

        <Alert className="mb-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>GitHub Email Issue Detected:</strong> Your GitHub email is private. Follow the steps below to fix
            this.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Setup Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Add your email directly to bypass GitHub email issues. Use GitHub ID: <strong>122022552</strong>
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="shahdilipkumar909@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Utkarsh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="githubId">GitHub ID</Label>
                <Input
                  id="githubId"
                  placeholder="122022552"
                  value={newGithubId}
                  onChange={(e) => setNewGithubId(e.target.value)}
                />
              </div>
              <Button onClick={handleAddAdmin} disabled={isLoading || !newEmail} className="w-full">
                {isLoading ? "Adding..." : "Setup Admin"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Current Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {admins.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No admins found</p>
                ) : (
                  admins.map((admin) => (
                    <div key={admin.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{admin.name}</div>
                      <div className="text-sm text-gray-600">{admin.email}</div>
                      <div className="text-xs text-gray-500">GitHub ID: {admin.githubId || "Not set"}</div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(admin.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Email Debugger
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                If you have a GitHub personal access token, paste it here to see your available emails.
              </AlertDescription>
            </Alert>
            <div>
              <Label htmlFor="githubToken">GitHub Personal Access Token (Optional)</Label>
              <Input
                id="githubToken"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
            </div>
            <Button onClick={handleFetchGithubEmails} disabled={!githubToken} className="w-full">
              Fetch GitHub Emails
            </Button>
            {githubData && (
              <div className="mt-4">
                <Label>GitHub Data:</Label>
                <Textarea
                  value={JSON.stringify(githubData, null, 2)}
                  readOnly
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fix GitHub Email Privacy Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>Your GitHub email is set to private. Choose one of these solutions:</AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-blue-800">Option 1: Make GitHub Email Public (Recommended)</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 mt-2">
                    <li>Go to GitHub Settings → Emails</li>
                    <li>Uncheck "Keep my email addresses private"</li>
                    <li>Make sure your email is verified</li>
                    <li>Try logging in again</li>
                  </ol>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-800">Option 2: Use Quick Setup Above</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 mt-2">
                    <li>Enter your email: shahdilipkumar909@gmail.com</li>
                    <li>Enter your name: Dishant Singh</li>
                    <li>Enter GitHub ID: 122022552</li>
                    <li>Click "Setup Admin"</li>
                    <li>Try logging in again</li>
                  </ol>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-800">Option 3: Add Public Email to GitHub</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 mt-2">
                    <li>Go to GitHub Settings → Emails</li>
                    <li>Add shahdilipkumar909@gmail.com if not already added</li>
                    <li>Verify the email</li>
                    <li>Set it as your public email</li>
                    <li>Try logging in again</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
