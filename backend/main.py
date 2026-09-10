from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4

from ecovalue import evaluate_item
from image_analysis import SUPPORTED_IMAGE_TYPES, analyze_device_image
from schemas import EvaluationRequest, EvaluationResponse, ImageAnalysisResponse

app = FastAPI(
    title="EcoTrace API",
    description="Local prototype API for collector-first e-waste value recovery.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "EcoTrace API", "status": "running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image(image: UploadFile = File(...)) -> dict:
    if image.content_type not in SUPPORTED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Please upload a JPEG, PNG, WEBP, or GIF image")
    image_bytes = await image.read()
    try:
        return analyze_device_image(image_bytes, image.filename or "device-image")
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post("/evaluate", response_model=EvaluationResponse)
def evaluate(request: EvaluationRequest) -> dict:
    item = request.model_dump()
    item["evaluation_id"] = f"EVAL-{uuid4().hex[:10].upper()}"
    return evaluate_item(item)
