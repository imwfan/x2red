import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CropIcon } from "lucide-react"
import { AreaSelector } from "./area-selector"

interface Position {
  x: number
  y: number
  width: number
  height: number
}

interface ButtonProps {
  id?: string
}

const captureFullPage = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) return

    const dataUrl = await chrome.tabs.captureVisibleTab(null, {
      format: "png"
    })

    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `twitter-screenshot-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("截图失败:", error)
  }
}

const FullScreenshot = ({ id }: ButtonProps) => {
  return (
    <Button 
      id={id}
      onClick={captureFullPage}
      variant="outline"
      size="icon"
      title="全页面截图">
      <Camera className="h-4 w-4" />
    </Button>
  )
}

const AreaScreenshot = ({ id }: ButtonProps) => {
  const [isSelecting, setIsSelecting] = useState(false)

  const startAreaSelection = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.id) return
    
    // 向内容脚本发送消息，开始选择区域
    await chrome.tabs.sendMessage(tab.id, { type: "START_AREA_SELECTION" })
    // 关闭弹出窗口
    window.close()
  }

  return (
    <>
      <Button 
        id={id}
        onClick={startAreaSelection}
        variant="outline"
        size="icon"
        title="区域截图">
        <CropIcon className="h-4 w-4" />
      </Button>
    </>
  )
}

// 导出组合组件
export const ScreenshotButton = {
  Full: FullScreenshot,
  Area: AreaScreenshot
} 