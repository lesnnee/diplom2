from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import os
from model import train_model, load_model

app = FastAPI()

MODEL_PATH = "model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"

AUTO_TRAIN_THRESHOLD = 10

new_data_counter = 0

# загрузка модели
model, vectorizer = load_model()


# =========================
# INPUT SCHEMAS
# =========================

class TicketInput(BaseModel):
    description: str


class TrainInput(BaseModel):
    description: str
    category: str
    priority: int


# =========================
# PREDICT
# =========================

@app.post("/predict")
def predict(data: TicketInput):
    global model, vectorizer

    if model is None or vectorizer is None:
        return {
            "category": "unknown",
            "priority": 3,
            "confidence": 0.0
        }

    X = vectorizer.transform([data.description])

    # prediction
    category = model.predict(X)[0]

    # confidence (если модель поддерживает proba)
    confidence = 0.0

    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)[0]
        confidence = float(max(proba))

    # базовая эвристика приоритета (пока не ML)
    priority = 2
    text = data.description.lower()

    if any(w in text for w in ["urgent", "critical", "down", "error", "not working"]):
        priority = 5
    elif any(w in text for w in ["slow", "issue", "problem"]):
        priority = 3
    else:
        priority = 2

    return {
        "category": category,
        "priority": priority,
        "confidence": confidence
    }


# =========================
# FEEDBACK + AUTO TRAIN
# =========================

@app.post("/feedback")
def feedback(data: TrainInput):
    global new_data_counter, model, vectorizer

    file_path = "dataset.csv"

    # если файла нет — создаём
    if not os.path.exists(file_path):
        df = pd.DataFrame(columns=["description", "category", "priority"])
    else:
        df = pd.read_csv(file_path)

    new_row = pd.DataFrame([{
        "description": data.description,
        "category": data.category,
        "priority": data.priority
    }])

    df = pd.concat([df, new_row], ignore_index=True)
    df.to_csv(file_path, index=False)

    new_data_counter += 1

    # =========================
    # AUTO TRAINING
    # =========================

    if new_data_counter >= AUTO_TRAIN_THRESHOLD:
        model, vectorizer = train_model()

        # сохраняем модель
        joblib.dump(model, MODEL_PATH)
        joblib.dump(vectorizer, VECTORIZER_PATH)

        new_data_counter = 0

        return {
            "message": "dataset saved + model retrained",
            "retrained": True
        }

    return {
        "message": "saved to dataset",
        "retrained": False
    }


# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "vectorizer_loaded": vectorizer is not None
    }