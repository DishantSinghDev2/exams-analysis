import { Loading } from "@/components/loading"

export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading message="Loading application..." size="lg" />
    </div>
  )
}
