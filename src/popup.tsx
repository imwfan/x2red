import { ScreenshotButton } from "~features/screenshot-button"
import { Label } from "@/components/ui/label"

import "~style.css"

function IndexPopup() {
  return (
    <div className="flex flex-col items-center justify-center w-[200px] gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <Label>Twitter 截图工具</Label>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="full-screenshot">全页面截图</Label>
            <ScreenshotButton.Full id="full-screenshot" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="area-screenshot">区域截图</Label>
            <ScreenshotButton.Area id="area-screenshot" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
