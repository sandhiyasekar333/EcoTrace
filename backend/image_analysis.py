from __future__ import annotations

from typing import Any


SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def analyze_device_image(image_bytes: bytes, filename: str = "") -> dict[str, Any]:
    """Return a deterministic prototype assessment that can be replaced by a real ML model.

    The current prototype does not claim to identify visual defects. It validates that an
    image was received and returns a conservative manual-review suggestion. A future CNN
    or vision model can implement this same function contract without changing the API.
    """
    if not image_bytes:
        raise ValueError("The uploaded image is empty")

    return {
        "detected_condition": "Moderate",
        "condition_score": 68,
        "detected_issues": [
            "Visual inspection is a prototype estimate",
            "Check casing, screen, ports, and visible cracks before handover",
        ],
        "confidence": 0.68,
        "analysis_method": "prototype_visual_review",
        "filename": filename,
    }
