import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface PreviewProps {
  imageUrl: string
  onClose: () => void
  onDownload: () => void
}

export const ScreenshotPreview = ({ imageUrl, onClose, onDownload }: PreviewProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "90%",
          maxHeight: "90%",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "18px" }}>截图预览</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            overflow: "auto",
            border: "1px solid #eee",
            borderRadius: "4px",
          }}
        >
          <img
            src={imageUrl}
            style={{
              display: "block",
              maxWidth: "100%",
              height: "auto",
            }}
            alt="截图预览"
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={onDownload}>
            下载截图
          </Button>
        </div>
      </div>
    </div>
  )
} 