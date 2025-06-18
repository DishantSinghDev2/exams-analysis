import { Loading } from "@/components/loading"

export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading message="Loading admin dashboard..." size="lg" />
    </div>
  )
}
