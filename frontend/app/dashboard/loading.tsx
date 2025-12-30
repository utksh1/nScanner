import { Skeleton } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
        <Skeleton className="h-[92px]" />
        <Skeleton className="h-[92px]" />
        <Skeleton className="h-[92px]" />
        <Skeleton className="h-[92px]" />
      </div>

      <Skeleton className="h-[420px]" />
    </div>
  )
}
