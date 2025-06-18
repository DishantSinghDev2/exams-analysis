import type { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && user.email) {
        // Check if user is authorized admin
        const admin = await prisma.admin.findUnique({
          where: { email: user.email },
        })

        console.log("Admin check for user:", user.email, "Found:", admin)

        if (!admin) {
          return false // Deny access
        }

        // Update or create admin record
        await prisma.admin.upsert({
          where: { email: user.email },
          update: {
            githubId: profile?.id?.toString() || "",
            name: user.name,
            avatar: user.image,
          },
          create: {
            email: user.email,
            githubId: profile?.id?.toString() || "",
            name: user.name,
            avatar: user.image,
          },
        })

        return true
      }
      return false
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const admin = await prisma.admin.findUnique({
          where: { email: session.user.email },
        })
        if (admin) {
          session.user.id = admin.id
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: undefined, // Prevent redirects on error
  },
}
