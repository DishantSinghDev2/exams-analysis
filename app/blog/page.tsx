import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Calendar, ArrowRight } from "lucide-react"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  exam: string
  subject: string
  shift?: string
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const blogDir = path.join(process.cwd(), "content/blog")

  if (!fs.existsSync(blogDir)) {
    return []
  }

  const examDirs = fs.readdirSync(blogDir)
  const posts: BlogPost[] = []

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
          const filePath = path.join(yearPath, file)
          const fileContent = fs.readFileSync(filePath, "utf8")
          const { data } = matter(fileContent)

          posts.push({
            slug: `${examDir}/${yearDir}/${file.replace(".md", "")}`,
            title: data.title || "Untitled",
            description: data.description || "",
            date: data.date || "",
            exam: data.exam || examDir,
            subject: data.subject || "",
            shift: data.shift,
          })
        }
      }
    }
  }

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  const examGroups = posts.reduce(
    (acc, post) => {
      if (!acc[post.exam]) {
        acc[post.exam] = []
      }
      acc[post.exam].push(post)
      return acc
    },
    {} as Record<string, BlogPost[]>,
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Exam Preparation Blog</h1>
          <p className="text-lg text-gray-600">
            Expert insights, tips, and analysis for NEET, JEE, and other competitive exams
          </p>
        </div>

        {Object.keys(examGroups).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No blog posts available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {Object.entries(examGroups).map(([exam, examPosts]) => (
              <div key={exam}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize">{exam} Preparation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {examPosts.map((post) => (
                    <Card key={post.slug} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {post.exam.toUpperCase()}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(post.date).toLocaleDateString()}
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            {post.subject && (
                              <Badge variant="outline" className="text-xs">
                                {post.subject}
                              </Badge>
                            )}
                            {post.shift && (
                              <Badge variant="outline" className="text-xs">
                                {post.shift}
                              </Badge>
                            )}
                          </div>
                          <Link
                            href={`/blog/${post.slug}`}
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Read More
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
