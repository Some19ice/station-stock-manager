import { LoadingScreen } from "@/components/ui/loading-screen"

export default function UserProfileLoading() {
  return (
    <LoadingScreen 
      title="User Profile"
      subtitle="Loading user details and activity..."
      variant="simple"
    />
  )
}
