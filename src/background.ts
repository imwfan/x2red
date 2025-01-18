chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURE_SCREENSHOT") {
    (async () => {
      try {
        // 捕获整个可见区域
        const dataUrl = await chrome.tabs.captureVisibleTab(null, {
          format: "png"
        })
        
        // 创建离屏 canvas
        const offscreenCanvas = new OffscreenCanvas(1, 1)
        const ctx = offscreenCanvas.getContext('2d')
        
        // 加载图片
        const blob = await (await fetch(dataUrl)).blob()
        const bitmap = await createImageBitmap(blob)
        
        // 设置 canvas 尺寸
        const position = message.position
        offscreenCanvas.width = position.width
        offscreenCanvas.height = position.height
        
        // 使用传入的滚动位置
        const x = Math.round(position.x - position.scrollX)
        const y = Math.round(position.y - position.scrollY)
        
        // 绘制裁剪后的图片
        ctx.drawImage(
          bitmap,
          x,
          y,
          position.width,
          position.height,
          0,
          0,
          position.width,
          position.height
        )

        // 转换为 base64
        const blob2 = await offscreenCanvas.convertToBlob({ type: 'image/png' })
        const reader = new FileReader()
        reader.onloadend = () => {
          sendResponse({ success: true, dataUrl: reader.result })
        }
        reader.readAsDataURL(blob2)
        
        // 清理资源
        bitmap.close()
      } catch (error) {
        console.error("截图失败:", error)
        sendResponse({ success: false, error: error.message })
      }
    })()
    return true
  }
}) 