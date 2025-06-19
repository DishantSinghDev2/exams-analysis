import Link from "next/link"
import { BarChart3, Github, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">ExamAnalyzer</span>
            </div>
            <p className="text-gray-400 mb-4">
              Comprehensive exam response analysis tool for students preparing for competitive exams like NEET, JEE, and
              more.
            </p>
            <div className="flex space-x-4">
              <a href="mailto:support@examanalyzer.com" className="text-gray-400 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white">
                  Response Analysis
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white">
                  Exam Preparation
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Exams</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/blog/neet" className="hover:text-white">
                  NEET
                </Link>
              </li>
              <li>
                <Link href="/blog/jee" className="hover:text-white">
                  JEE Mains
                </Link>
              </li>
              <li>
                <Link href="/blog/jee" className="hover:text-white">
                  JEE Advanced
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} DishIs Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
