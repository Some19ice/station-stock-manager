"use client"

import { useEffect, useCallback } from "react"

// Custom event for opening inventory modal
const INVENTORY_MODAL_EVENT = "open-inventory-modal"

export function useInventoryModalTrigger() {
  const openAddProductModal = useCallback(() => {
    window.dispatchEvent(new CustomEvent(INVENTORY_MODAL_EVENT, { 
      detail: { action: "add-product" } 
    }))
  }, [])

  return { openAddProductModal }
}

export function useInventoryModalListener(onOpenAddProduct: () => void) {
  useEffect(() => {
    const handleModalEvent = (event: CustomEvent) => {
      if (event.detail?.action === "add-product") {
        onOpenAddProduct()
      }
    }

    window.addEventListener(INVENTORY_MODAL_EVENT, handleModalEvent as EventListener)
    
    return () => {
      window.removeEventListener(INVENTORY_MODAL_EVENT, handleModalEvent as EventListener)
    }
  }, [onOpenAddProduct])
}
