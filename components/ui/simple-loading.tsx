"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleLoadingProps {
  message?: string
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "pulse"
}

export function SimpleLoading({
  message = "Loading...",
  className = "",
  size = "md",
  variant = "spinner"
}: SimpleLoadingProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  const SpinnerVariant = () => (
    <Loader2 className={cn("animate-spin text-primary", sizes[size])} />
  )

  const DotsVariant = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn("bg-primary rounded-full", 
            size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )

  const PulseVariant = () => (
    <motion.div
      className={cn("bg-primary/20 rounded-full", sizes[size])}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className={cn("bg-primary rounded-full h-full w-full", 
        "animate-pulse"
      )} />
    </motion.div>
  )

  const renderVariant = () => {
    switch (variant) {
      case "dots": return <DotsVariant />
      case "pulse": return <PulseVariant />
      default: return <SpinnerVariant />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("flex flex-col items-center justify-center gap-3", className)}
    >
      {renderVariant()}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "text-muted-foreground text-center",
            size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
          )}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  )
}
