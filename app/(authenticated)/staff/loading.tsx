import { LoadingScreen } from "@/components/ui/loading-screen"

export default function StaffLoading() {
  return (
    <LoadingScreen 
      title="Staff Dashboard"
      subtitle="Loading your sales data..."
      variant="simple"
      showMetrics={false}
      showAlerts={false}
    />
  )
}
