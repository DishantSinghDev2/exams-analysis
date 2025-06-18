import { Loading } from "@/components/loading"

export default function BlogLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading message="Loading blog posts..." size="lg" />
    </div>
  )
}
