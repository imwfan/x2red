import { useEffect, useState } from "react"
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      e.stopPropagation()
      
      // 获取鼠标位置下的所有元素
      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      
      // 找到第一个有效的目标元素
      const targetElement = elements.find(el => {
        // 忽略我们的覆盖层元素
        const overlayRoot = document.getElementById("area-selector-root")
        if (overlayRoot?.contains(el)) return false
        
        // 忽略 body、html 和一些通用容器
        const tagName = el.tagName.toLowerCase()
        if (['body', 'html', 'div'].includes(tagName)) return false
        
        // 检查元素是否有实际内容或有意义的尺寸
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return false
        
        // 检查元素是否可见
        const style = window.getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden') return false
        
        return true
      })

      if (targetElement && targetElement !== highlightedElement) {
        // 尝试找到最近的有意义的父元素
        let bestTarget = targetElement
        let parent = targetElement.parentElement
        
        while (parent && parent.tagName.toLowerCase() !== 'body') {
          const parentRect = parent.getBoundingClientRect()
          const targetRect = bestTarget.getBoundingClientRect()
          
          // 如果父元素的尺寸相近，可能是更好的目标
          if (Math.abs(parentRect.width - targetRect.width) < 10 &&
              Math.abs(parentRect.height - targetRect.height) < 10) {
            bestTarget = parent
          }
          parent = parent.parentElement
        }
        
        setHighlightedElement(bestTarget)
      }
    }

    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (highlightedElement) {
        const rect = highlightedElement.getBoundingClientRect()
        const scrollX = window.scrollX
        const scrollY = window.scrollY
        
        onSelected({
          x: rect.left + scrollX,
          y: rect.top + scrollY,
          width: rect.width,
          height: rect.height
        })
      }
    }

    // 阻止默认的选择行为
    const preventDefault = (e: Event) => {
      e.preventDefault()
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("dblclick", handleDoubleClick)
    document.addEventListener("selectstart", preventDefault)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("dblclick", handleDoubleClick)
      document.removeEventListener("selectstart", preventDefault)
    }
  }, [highlightedElement, onSelected])

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