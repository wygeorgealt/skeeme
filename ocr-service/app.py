import base64
import io
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from paddleocr import PaddleOCR
from PIL import Image

app = FastAPI(title="Skeeme PaddleOCR Service")

# Initialize PaddleOCR (downloads models on first run)
# use_angle_cls=True enables orientation classification
# lang="en" for English, but PaddleOCR is multilingual by default
ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)

class OCRRequest(BaseModel):
    image: str  # Base64 encoded image

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/ocr")
async def perform_ocr(request: OCRRequest):
    try:
        # 1. Decode base64 image
        try:
            image_data = base64.b64decode(request.image)
            img = Image.open(io.BytesIO(image_data)).convert("RGB")
            img_array = np.array(img)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

        # 2. Run OCR
        # result is a list of lists: [[box, (text, confidence)], ...]
        result = ocr.ocr(img_array, cls=True)

        # 3. Format response
        formatted_results = []
        if result and result[0]:
            for line in result[0]:
                box = line[0]
                text, confidence = line[1]
                formatted_results.append({
                    "text": text,
                    "confidence": float(confidence),
                    "box": box
                })

        # 4. Join text for simple response
        full_text = " ".join([r["text"] for r in formatted_results])

        return {
            "text": full_text,
            "lines": formatted_results
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
