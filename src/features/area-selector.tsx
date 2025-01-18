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
  
  // 使用 useCallback 包装处理函数，避免重复创建
  const handleCapture = useCallback(async (element: Element) => {
    if (isCapturing) return
    setIsCapturing(true)
    
    const rect = element.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    
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
      e.stopPropagation()
      
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
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("dblclick", handleDoubleClick)
    document.addEventListener("selectstart", preventDefault)
    document.addEventListener("mousedown", preventDefault)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("dblclick", handleDoubleClick)
      document.removeEventListener("selectstart", preventDefault)
      document.removeEventListener("mousedown", preventDefault)
    }
  }, [highlightedElement, handleCapture, isCapturing])

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
        }}
      />
      <div style={overlayStyle} />
    </>,
    document.body
  )
} 