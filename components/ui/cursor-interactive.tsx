"use client"

import { ReactNode, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface CursorInteractiveProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  cursorType?: "hover" | "click" | "drag" | "text" | "loading"
  className?: string
}

export function CursorInteractive({
  children,
  cursorType = "hover",
  className,
  ...props
}: CursorInteractiveProps) {
  return (
    <div
      className={cn("cursor-none", className)}
      data-cursor={cursorType}
      {...props}
    >
      {children}
    </div>
  )
}

// Specialized components for common use cases
export function CursorButton({ children, className, ...props }: HTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={cn("cursor-none", className)}
      data-cursor="hover"
      {...props}
    >
      {children}
    </button>
  )
}

export function CursorLink({ children, className, ...props }: HTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a
      className={cn("cursor-none", className)}
      data-cursor="hover"
      {...props}
    >
      {children}
    </a>
  )
}

export function CursorDraggable({ children, className, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn("cursor-none", className)}
      data-cursor="drag"
      draggable
      {...props}
    >
      {children}
    </div>
  )
}

export function CursorLoading({ children, className, ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn("cursor-none", className)}
      data-cursor="loading"
      {...props}
    >
      {children}
    </div>
  )
}
