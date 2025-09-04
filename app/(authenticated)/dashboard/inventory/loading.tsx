import { LoadingScreen } from "@/components/ui/loading-screen"

export default function InventoryLoading() {
  return (
    <LoadingScreen 
      title="Inventory Management"
      subtitle="Loading stock levels and product data..."
      variant="inventory"
    />
  )
}
