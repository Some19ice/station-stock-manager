"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type CursorState = "default" | "hover" | "click" | "drag" | "text" | "loading"
type CursorTheme = "default" | "business" | "minimal"

interface CursorContextType {
  cursorState: CursorState
  setCursorState: (state: CursorState) => void
  cursorTheme: CursorTheme
  setCursorTheme: (theme: CursorTheme) => void
  isEnabled: boolean
  setIsEnabled: (enabled: boolean) => void
}

const CursorContext = createContext<CursorContextType | undefined>(undefined)

export function CursorProvider({ children }: { children: ReactNode }) {
  const [cursorState, setCursorState] = useState<CursorState>("default")
  const [cursorTheme, setCursorTheme] = useState<CursorTheme>("business")
  const [isEnabled, setIsEnabled] = useState(true)

  return (
    <CursorContext.Provider
      value={{
        cursorState,
        setCursorState,
        cursorTheme,
        setCursorTheme,
        isEnabled,
        setIsEnabled
      }}
    >
      {children}
    </CursorContext.Provider>
  )
}

export function useCursor() {
  const context = useContext(CursorContext)
  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider")
  }
  return context
}

// Utility hook for cursor interactions
export function useCursorInteraction() {
  const { setCursorState } = useCursor()

  const onHover = () => setCursorState("hover")
  const onLeave = () => setCursorState("default")
  const onClick = () => {
    setCursorState("click")
    setTimeout(() => setCursorState("hover"), 150)
  }
  const onDrag = () => setCursorState("drag")
  const onText = () => setCursorState("text")
  const onLoading = () => setCursorState("loading")

  return {
    onHover,
    onLeave,
    onClick,
    onDrag,
    onText,
    onLoading,
    cursorProps: {
      onMouseEnter: onHover,
      onMouseLeave: onLeave,
      onMouseDown: onClick
    }
  }
}
