import type { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      profile: async (profile, tokens) => {

        let email = profile.email

        // If email is not public, fetch it from the emails API
        if (!email && tokens.access_token) {
          try {
            const emailsResponse = await fetch("https://api.github.com/user/emails", {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                "User-Agent": "ExamAnalyzer",
              },
            })

            if (emailsResponse.ok) {
              const emails = await emailsResponse.json()
              console.log("GitHub emails fetched:", emails)

              // Find primary email or first verified email
              const primaryEmail = emails.find((e: any) => e.primary && e.verified)
              const verifiedEmail = emails.find((e: any) => e.verified)

              email = primaryEmail?.email || verifiedEmail?.email || emails[0]?.email
              console.log("Selected email:", email)
            }
          } catch (error) {
            console.error("Failed to fetch GitHub emails:", error)
          }
        }

        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: email,
          image: profile.avatar_url,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn attempt:", {
        email: user.email,
        name: user.name,
        githubId: profile?.id?.toString(),
        userObject: user,
      })

      if (account?.provider === "github") {
        // Check if we have an email
        if (!user.email) {
          console.log("SignIn denied: No email found in GitHub profile")
          return false
        }

        try {
          // Check if user is authorized admin by email
          const admin = await prisma.admin.findUnique({
            where: { email: user.email },
          })

          console.log("Admin lookup result:", admin)

          if (!admin) {
            console.log("Access denied: Email not found in admin list:", user.email)
            return false // Deny access
          }

          // Update admin record with current GitHub info
          const updatedAdmin = await prisma.admin.update({
            where: { email: user.email },
            data: {
              githubId: profile?.id?.toString() || "",
              name: user.name || admin.name,
              avatar: user.image,
            },
          })

          console.log("Admin updated successfully:", updatedAdmin)
          return true
        } catch (error) {
          console.error("SignIn error:", error)
          return false
        }
      }

      console.log("SignIn denied: Invalid provider")
      return false
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const admin = await prisma.admin.findUnique({
            where: { email: session.user.email },
          })
          if (admin) {
            session.user.id = admin.id
            session.user.isAdmin = true
          }
        } catch (error) {
          console.error("Session callback error:", error)
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
}
