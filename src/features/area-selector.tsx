import { useEffect, useState, useCallback } from "react"
import { createPortal } from "react-dom"

interface Position {
  x: number
  y: number
  width: number
  height: number
}

interface AreaSelectorProps {
  onSelected: (position: Position) => void
}

export const AreaSelector = ({ onSelected }: AreaSelectorProps) => {
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  
  const clearSelection = useCallback(() => {
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges()
    }
  }, [])
  
  const handleCapture = useCallback(async (element: Element) => {
    if (isCapturing) return
    setIsCapturing(true)
    
    const rect = element.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    
    setHighlightedElement(null)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      await onSelected({
        x: rect.left + scrollX,
        y: rect.top + scrollY,
        width: rect.width,
        height: rect.height
      })
    } finally {
      setIsCapturing(false)
    }
  }, [isCapturing, onSelected])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isCapturing) return
      clearSelection()
      
      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      
      const targetElement = elements.find(el => {
        const overlayRoot = document.getElementById("area-selector-root")
        if (overlayRoot?.contains(el)) return false
        
        const tagName = el.tagName.toLowerCase()
        if (['body', 'html', 'div'].includes(tagName)) return false
        
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return false
        
        const style = window.getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden') return false
        
        return true
      })

      if (targetElement && targetElement !== highlightedElement) {
        setHighlightedElement(targetElement)
      }
    }

    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (highlightedElement) {
        handleCapture(highlightedElement)
      }
    }

    const preventDefault = (e: Event) => {
      e.preventDefault()
      clearSelection()
    }

    // 使用 passive: false 来确保可以阻止默认行为
    document.addEventListener("mousemove", handleMouseMove, { passive: false })
    document.addEventListener("dblclick", handleDoubleClick, { passive: false })
    document.addEventListener("selectstart", preventDefault, { passive: false })
    document.addEventListener("mousedown", preventDefault, { passive: false })

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("dblclick", handleDoubleClick)
      document.removeEventListener("selectstart", preventDefault)
      document.removeEventListener("mousedown", preventDefault)
    }
  }, [highlightedElement, handleCapture, isCapturing, clearSelection])

  if (!highlightedElement) return null

  const rect = highlightedElement.getBoundingClientRect()

  const overlayStyle = {
    position: "fixed" as const,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    border: "2px solid #1a73e8",
    backgroundColor: "rgba(26, 115, 232, 0.1)",
    pointerEvents: "none" as const,
    zIndex: 999999,
    cursor: "crosshair",
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
  }

  return createPortal(
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: "crosshair",
          zIndex: 999998,
          pointerEvents: "all",
          backgroundColor: "transparent",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      />
      <div style={overlayStyle} />
    </>,
    document.body
  )
} 