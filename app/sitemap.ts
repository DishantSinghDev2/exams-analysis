import type { MetadataRoute } from "next"
import fs from "fs"
import path from "path"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
  ]

  // Dynamic blog pages
  const blogPages: MetadataRoute.Sitemap = []
  const blogDir = path.join(process.cwd(), "content/blog")

  if (fs.existsSync(blogDir)) {
    const examDirs = fs.readdirSync(blogDir)

    for (const examDir of examDirs) {
      const examPath = path.join(blogDir, examDir)
      if (!fs.statSync(examPath).isDirectory()) continue

      const yearDirs = fs.readdirSync(examPath)
      for (const yearDir of yearDirs) {
        const yearPath = path.join(examPath, yearDir)
        if (!fs.statSync(yearPath).isDirectory()) continue

        const files = fs.readdirSync(yearPath)
        for (const file of files) {
          if (file.endsWith(".md")) {
            const slug = file.replace(".md", "")
            blogPages.push({
              url: `${baseUrl}/blog/${examDir}/${yearDir}/${slug}`,
              lastModified: new Date(),
              changeFrequency: "weekly",
              priority: 0.6,
            })
          }
        }
      }
    }
  }

  return [...staticPages, ...blogPages]
}
