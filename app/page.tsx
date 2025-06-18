import type { Metadata } from "next"
import HomePage from "./home-page"

export const metadata: Metadata = {
  title: "Exam Response Analyzer - Detailed Subject-wise Analysis",
  description:
    "Upload your NEET, JEE, CUET response sheet and get comprehensive subject-wise performance analysis with detailed question-by-question breakdown.",
  keywords: ["exam analysis", "NEET", "JEE", "CUET", "response sheet", "subject-wise analysis", "competitive exams"],
  authors: [{ name: "ExamAnalyzer Team" }],
  openGraph: {
    title: "Exam Response Analyzer",
    description: "Get detailed analysis of your exam performance",
    type: "website",
    url: "https://examanalyzer.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exam Response Analyzer",
    description: "Get detailed analysis of your exam performance",
  },
}

export default function Page() {
  return <HomePage />
}
