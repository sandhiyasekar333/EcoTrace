from typing import Any, List

from pydantic import BaseModel, Field


class EvaluationRequest(BaseModel):
    item_type: str = Field(min_length=1)
    brand: str = Field(min_length=1)
    model: str = ""
    age: float = Field(ge=0, le=100)
    working_condition: str = Field(min_length=1)
    physical_condition: str = Field(min_length=1)
    repairability: str = Field(min_length=1)
    reusable_components: List[str] = Field(default_factory=list)
    quantity: int = Field(default=1, ge=1)
    expected_price: float = Field(default=0, ge=0)
    image_analysis: dict[str, Any] | None = None


class ImageAnalysisResponse(BaseModel):
    detected_condition: str
    condition_score: int
    detected_issues: List[str]
    confidence: float
    analysis_method: str
    filename: str


class EvaluationResponse(BaseModel):
    evaluation_id: str
    item: dict[str, Any]
    reuse_score: int
    parts_score: int
    recycle_score: int
    recommended_route: str
    fair_value: int
    estimated_fair_value: int
    estimated_min_value: int
    estimated_max_value: int
    reasoning: List[str]
    risk_or_notes: str
