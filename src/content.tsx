import { createRoot } from "react-dom/client"
import { AreaSelector } from "./features/area-selector"
import { ScreenshotPreview } from "./features/screenshot-preview"

// 添加样式到 head
const style = document.createElement('style')
style.textContent = `
  .area-selector-overlay {
    user-select: none !important;
    -webkit-user-select: none !important;
  }
`
document.head.appendChild(style)

// 跟踪选择器是否已激活
let isSelecting = false

// 渲染预览
const renderPreview = (dataUrl: string, container: HTMLElement, root: Root) => {
  root.render(
    <ScreenshotPreview
      imageUrl={dataUrl}
      onClose={() => {
        document.body.removeChild(container)
        root.unmount()
        isSelecting = false
      }}
      onDownload={() => {
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = `twitter-area-screenshot-${Date.now()}.png`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        document.body.removeChild(container)
        root.unmount()
        isSelecting = false
      }}
    />
  )
}

// 监听来自扩展的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "START_AREA_SELECTION") {
    if (isSelecting) return
    isSelecting = true
    
    const container = document.createElement("div")
    container.id = "area-selector-root"
    document.body.appendChild(container)

    const root = createRoot(container)
    root.render(
      <div className="area-selector-overlay">
        <AreaSelector
          onSelected={async (position) => {
            try {
              chrome.runtime.sendMessage({
                type: "CAPTURE_SCREENSHOT",
                position: {
                  x: Math.round(position.x),
                  y: Math.round(position.y),
                  width: Math.round(position.width),
                  height: Math.round(position.height),
                  scrollX: window.scrollX,
                  scrollY: window.scrollY
                }
              }, response => {
                if (response && response.success) {
                  // 显示预览而不是直接下载
                  renderPreview(response.dataUrl, container, root)
                } else {
                  console.error("截图失败:", response?.error || "未知错误")
                  document.body.removeChild(container)
                  root.unmount()
                  isSelecting = false
                }
              })
            } catch (error) {
              console.error("区域截图失败:", error)
              document.body.removeChild(container)
              root.unmount()
              isSelecting = false
            }
          }}
        />
      </div>
    )
  }
})
