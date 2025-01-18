import { createRoot } from "react-dom/client"
import { AreaSelector } from "./features/area-selector"

// 监听来自扩展的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "START_AREA_SELECTION") {
    // 创建容器元素
    const container = document.createElement("div")
    container.id = "area-selector-root"
    document.body.appendChild(container)

    // 渲染区域选择器
    const root = createRoot(container)
    root.render(
      <AreaSelector
        onSelected={async (position) => {
          try {
            // 捕获可视区域的截图
            const dataUrl = await chrome.tabs.captureVisibleTab(null, {
              format: "png"
            })

            // 创建图片对象
            const img = new Image()
            img.src = dataUrl
            
            await new Promise((resolve) => {
              img.onload = resolve
            })

            // 创建 canvas 并裁剪图片
            const canvas = document.createElement("canvas")
            canvas.width = position.width
            canvas.height = position.height
            
            const ctx = canvas.getContext("2d")
            ctx.drawImage(
              img,
              position.x - window.scrollX,
              position.y - window.scrollY,
              position.width,
              position.height,
              0,
              0,
              position.width,
              position.height
            )

            // 下载截图
            const link = document.createElement("a")
            link.href = canvas.toDataURL()
            link.download = `twitter-area-screenshot-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          } catch (error) {
            console.error("区域截图失败:", error)
          } finally {
            // 清理区域选择器
            document.body.removeChild(container)
          }
        }}
      />
    )
  }
})
