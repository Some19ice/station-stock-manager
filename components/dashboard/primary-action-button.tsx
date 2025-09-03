"use client"

import { PlusIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface PrimaryActionButtonProps {
  className?: string
}

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  className = ""
}) => {
  const router = useRouter()

  const handleRecordSale = () => {
    router.push("/staff/sales")
  }

  return (
    <div className={`mb-8 ${className}`}>
      <Button
        onClick={handleRecordSale}
        className="/* Ensure minimum touch target */ min-h-[60px] w-full rounded-lg bg-blue-600 px-8 py-6 font-bold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 active:bg-blue-800"
        size="lg"
      >
        <div className="flex items-center justify-center space-x-3">
          <PlusIcon className="h-6 w-6" />
          <span className="text-xl">Record New Sale</span>
        </div>
      </Button>
    </div>
  )
}
