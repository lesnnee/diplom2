from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import pickle
import os

app = FastAPI()

# =====================
# ПУТИ К ФАЙЛАМ
# =====================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ml_model_simple.pkl")  # используем простую модель
FEEDBACK_PATH = os.path.join(BASE_DIR, "backend", "feedback_dataset.csv")

AUTO_TRAIN_THRESHOLD = 10
new_data_counter = 0

# =====================
# ЗАГРУЗКА МОДЕЛИ
# =====================
def load_model():
    if not os.path.exists(MODEL_PATH):
        print(f"⚠️ Model not found at {MODEL_PATH}")
        return None
    
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
        return model


model = load_model()
if model:
    print(f"✅ Model loaded successfully from {MODEL_PATH}")
    if hasattr(model, 'classes_'):
        print(f"   Classes: {model.classes_}")
else:
    print("❌ Failed to load model")


# =========================
# INPUT SCHEMAS
# =========================
class TicketInput(BaseModel):
    description: str


class TrainInput(BaseModel):
    description: str
    category: str
    priority: int = 3


# =========================
# PREDICT
# =========================
@app.post("/predict")
def predict(data: TicketInput):
    global model

    if model is None:
        return {
            "category": "unknown",
            "priority": 3,
            "confidence": 0.0,
            "error": "model_not_loaded"
        }

    try:
        category = model.predict([data.description])[0]
        
        confidence = 0.0
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba([data.description])[0]
            confidence = float(max(proba))
        
        THRESHOLD = 0.90
        auto_approved = confidence >= THRESHOLD
        
        if not auto_approved:
            category = "manual_review"
        
        # Эвристика приоритета
        priority = 2
        text = data.description.lower()

        if any(w in text for w in ["urgent", "critical", "down", "срочно", "критично", "лежит"]):
            priority = 5
        elif any(w in text for w in ["slow", "error", "problem", "медленно", "ошибка", "не работает"]):
            priority = 3
        else:
            priority = 2

        return {
            "category": category,
            "priority": priority,
            "confidence": confidence,
            "auto_approved": auto_approved,
            "threshold": THRESHOLD
        }
    
    except Exception as e:
        return {
            "category": category,
            "priority": priority,
            "confidence": confidence,        # ← добавить
            "auto_approved": auto_approved,  # ← добавить
            "threshold": THRESHOLD
        }


# =========================
# FEEDBACK
# =========================
@app.post("/feedback")
def feedback(data: TrainInput):
    global new_data_counter

    os.makedirs(os.path.dirname(FEEDBACK_PATH), exist_ok=True)

    if not os.path.exists(FEEDBACK_PATH):
        df = pd.DataFrame(columns=["description", "category", "priority", "timestamp"])
    else:
        df = pd.read_csv(FEEDBACK_PATH)

    new_row = pd.DataFrame([{
        "description": data.description,
        "category": data.category,
        "priority": data.priority,
        "timestamp": pd.Timestamp.now().isoformat()
    }])

    df = pd.concat([df, new_row], ignore_index=True)
    df.to_csv(FEEDBACK_PATH, index=False)

    new_data_counter += 1

    return {
        "message": "feedback saved",
        "total_feedback": len(df),
        "pending_for_retrain": new_data_counter,
        "auto_train_threshold": AUTO_TRAIN_THRESHOLD
    }


# =========================
# HEALTH CHECK
# =========================
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "feedback_file": FEEDBACK_PATH
    }


# =========================
# STATS
# =========================
@app.get("/stats")
def stats():
    if not os.path.exists(FEEDBACK_PATH):
        return {"total_feedback": 0}
    
    df = pd.read_csv(FEEDBACK_PATH)
    return {
        "total_feedback": len(df),
        "categories": df["category"].value_counts().to_dict(),
        "pending_feedback": new_data_counter
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)