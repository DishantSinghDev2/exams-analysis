import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User } from "lucide-react"
import Link from "next/link"
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

interface BlogPostProps {
  params: {
    slug: string[]
  }
}

async function getBlogPost(slug: string[]) {
  const blogPath = path.join(process.cwd(), "content/blog", ...slug) + ".md"

  if (!fs.existsSync(blogPath)) {
    return null
  }

  const fileContent = fs.readFileSync(blogPath, "utf8")
  const { data, content } = matter(fileContent)

  const processedContent = await remark().use(html).process(content)

  const contentHtml = processedContent.toString()

  return {
    frontmatter: data,
    content: contentHtml,
    slug: slug.join("/"),
  }
}

export default async function BlogPost({ params }: BlogPostProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/blog">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.frontmatter.exam && <Badge variant="secondary">{post.frontmatter.exam.toUpperCase()}</Badge>}
            {post.frontmatter.subject && <Badge variant="outline">{post.frontmatter.subject}</Badge>}
            {post.frontmatter.shift && <Badge variant="outline">{post.frontmatter.shift}</Badge>}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.frontmatter.title}</h1>

          <div className="flex items-center gap-4 text-gray-600 text-sm mb-8">
            {post.frontmatter.date && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(post.frontmatter.date).toLocaleDateString()}
              </div>
            )}
            {post.frontmatter.author && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {post.frontmatter.author}
              </div>
            )}
          </div>

          {post.frontmatter.description && <p className="text-lg text-gray-600 mb-8">{post.frontmatter.description}</p>}
        </div>

        <article className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </div>
  )
}
