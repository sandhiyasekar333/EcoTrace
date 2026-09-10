from __future__ import annotations

from dataclasses import dataclass
from typing import Any


BASE_VALUES = {
    "Laptop": 8000,
    "Mobile": 5000,
    "Television": 4000,
    "Monitor": 2500,
    "Printer": 2000,
    "Battery": 800,
    "Charger": 300,
    "Computer Parts": 1500,
    "Other": 1000,
}

ROUTE_LABELS = {
    "reuse": "Reuse / Refurbishment",
    "parts": "Parts Recovery",
    "recycle": "Material Recycling",
}


@dataclass
class ScoreBreakdown:
    reuse: int = 0
    parts: int = 0
    recycle: int = 0


def _bounded(value: int) -> int:
    return max(0, min(100, value))


def _normalise(value: str) -> str:
    return " ".join(value.strip().lower().split())


def _age_adjustment(age: float, scores: ScoreBreakdown) -> None:
    if age <= 2:
        scores.reuse += 25
    elif age <= 5:
        scores.reuse += 15
        scores.parts += 10
    elif age <= 8:
        scores.parts += 15
        scores.recycle += 10
    else:
        scores.parts += 5
        scores.recycle += 25


def _condition_adjustment(condition: str, scores: ScoreBreakdown) -> None:
    condition = _normalise(condition)
    if condition == "working":
        scores.reuse += 50
        scores.parts += 20
        scores.recycle += 10
    elif condition == "partially working":
        scores.reuse += 25
        scores.parts += 45
        scores.recycle += 25
    else:
        scores.reuse += 5
        scores.parts += 40
        scores.recycle += 55


def _physical_adjustment(condition: str, scores: ScoreBreakdown) -> None:
    condition = _normalise(condition)
    if condition == "good":
        scores.reuse += 20
    elif condition == "moderate":
        scores.reuse += 10
        scores.parts += 15
    else:
        scores.parts += 15
        scores.recycle += 20


def _repairability_adjustment(repairability: str, scores: ScoreBreakdown) -> None:
    repairability = _normalise(repairability)
    if repairability == "easy":
        scores.reuse += 15
    elif repairability == "moderate":
        scores.reuse += 5
        scores.parts += 10
    else:
        scores.parts += 5
        scores.recycle += 15


def _value_multiplier(working_condition: str, age: float) -> float:
    condition_multiplier = {
        "working": 1.0,
        "partially working": 0.65,
        "not working": 0.35,
    }
    if age <= 2:
        age_multiplier = 1.0
    elif age <= 5:
        age_multiplier = 0.8
    elif age <= 8:
        age_multiplier = 0.6
    else:
        age_multiplier = 0.4
    return condition_multiplier.get(_normalise(working_condition), 0.35) * age_multiplier


def _build_reasons(item: dict[str, Any], route_key: str) -> list[str]:
    reasons: list[str] = []
    working = _normalise(item["working_condition"])
    physical = _normalise(item["physical_condition"])
    repairability = _normalise(item["repairability"])
    age = float(item["age"])
    components = item.get("reusable_components", [])

    if working == "working":
        reasons.append("Device is still functional")
    elif working == "partially working":
        reasons.append("Some functionality remains, supporting repair or parts recovery")
    else:
        reasons.append("The non-working condition makes material and parts recovery more suitable")

    if age <= 2:
        reasons.append("The recent age indicates strong remaining usefulness")
    elif age <= 5:
        reasons.append("The device age leaves useful value for repair and component recovery")
    else:
        reasons.append("The older age increases the likelihood of parts or material recovery")

    if physical == "good":
        reasons.append("Physical condition supports refurbishment")
    elif physical == "moderate":
        reasons.append("Moderate physical condition supports selective repair or parts recovery")
    else:
        reasons.append("Physical damage reduces reuse potential")

    if repairability == "easy":
        reasons.append("Easy repairability supports a reuse-first route")
    elif repairability == "moderate":
        reasons.append("Moderate repairability keeps both reuse and parts recovery viable")
    else:
        reasons.append("Difficult repairability lowers the likelihood of refurbishment")

    if components:
        reasons.append(f"{len(components)} reusable component(s) were identified")

    if route_key == "reuse":
        reasons.append("Reuse may preserve more value than raw material recovery")
    elif route_key == "parts":
        reasons.append("Recovering usable components can preserve value beyond material recycling")
    else:
        reasons.append("Material recycling is the strongest available recovery route for this condition")
    return reasons


def evaluate_item(item: dict[str, Any]) -> dict[str, Any]:
    scores = ScoreBreakdown()
    _condition_adjustment(item["working_condition"], scores)
    _age_adjustment(float(item["age"]), scores)
    _physical_adjustment(item["physical_condition"], scores)
    _repairability_adjustment(item["repairability"], scores)
    scores.parts += min(24, len(item.get("reusable_components", [])) * 3)

    score_values = {
        "reuse_score": _bounded(scores.reuse),
        "parts_score": _bounded(scores.parts),
        "recycle_score": _bounded(scores.recycle),
    }
    route_key = max(
        (("reuse", score_values["reuse_score"]), ("parts", score_values["parts_score"]), ("recycle", score_values["recycle_score"])),
        key=lambda pair: pair[1],
    )[0]

    base_value = BASE_VALUES.get(item["item_type"], BASE_VALUES["Other"])
    fair_value = base_value * _value_multiplier(item["working_condition"], float(item["age"]))
    estimated_min = int(round((fair_value * 0.9) / 50) * 50)
    estimated_max = int(round((fair_value * 1.1) / 50) * 50)

    return {
        "evaluation_id": item["evaluation_id"],
        "item": {key: value for key, value in item.items() if key != "evaluation_id"},
        **score_values,
        "recommended_route": ROUTE_LABELS[route_key],
        "fair_value": int(round(fair_value / 50) * 50),
        "estimated_fair_value": int(round(fair_value / 50) * 50),
        "estimated_min_value": estimated_min,
        "estimated_max_value": estimated_max,
        "reasoning": _build_reasons(item, route_key),
        "risk_or_notes": "This is a transparent prototype estimate, not a guaranteed market price. Final value may change after physical inspection and weighing.",
    }
