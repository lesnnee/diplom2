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

# Модель категорий (простая, конвертированная)
CATEGORY_MODEL_PATH = os.path.join(BASE_DIR, "ml_model_simple.pkl")

# Модель приоритетов (уже Pipeline)
PRIORITY_MODEL_PATH = os.path.join(BASE_DIR, "ml_model_priority.pkl")

FEEDBACK_PATH = os.path.join(BASE_DIR, "backend", "feedback_dataset.csv")

AUTO_TRAIN_THRESHOLD = 10
new_data_counter = 0

# =====================
# ЗАГРУЗКА МОДЕЛЕЙ
# =====================
category_model = None
priority_model = None

def load_models():
    global category_model, priority_model
    
    # Загрузка модели категорий
    if os.path.exists(CATEGORY_MODEL_PATH):
        with open(CATEGORY_MODEL_PATH, "rb") as f:
            category_model = pickle.load(f)
        print(f"✅ Category model loaded from {CATEGORY_MODEL_PATH}")
        if hasattr(category_model, 'classes_'):
            print(f"   Classes: {category_model.classes_}")
    else:
        print(f"⚠️ Category model not found at {CATEGORY_MODEL_PATH}")
    
    # Загрузка модели приоритетов
    if os.path.exists(PRIORITY_MODEL_PATH):
        with open(PRIORITY_MODEL_PATH, "rb") as f:
            priority_model = pickle.load(f)
        print(f"✅ Priority model loaded from {PRIORITY_MODEL_PATH}")
    else:
        print(f"⚠️ Priority model not found at {PRIORITY_MODEL_PATH}")

load_models()


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
# PREDICT (с поддержкой priority модели)
# =========================
@app.post("/predict")
def predict(data: TicketInput):
    global category_model, priority_model

    if category_model is None:
        return {
            "category": "unknown",
            "priority": 3,
            "confidence_category": 0.0,
            "confidence_priority": 0.0,
            "error": "category_model_not_loaded"
        }

    try:
        # 1. ПРЕДСКАЗАНИЕ КАТЕГОРИИ
        category = category_model.predict([data.description])[0]
        
        confidence_category = 0.0
        category_probabilities = {}
        
        if hasattr(category_model, "predict_proba"):
            proba = category_model.predict_proba([data.description])[0]
            confidence_category = float(max(proba))
            category_probabilities = {
                label: float(prob) for label, prob in zip(category_model.classes_, proba)
            }
        
        THRESHOLD = 0.90
        auto_approved = confidence_category >= THRESHOLD
        
        final_category = category if auto_approved else "manual_review"
        
        # 2. ПРЕДСКАЗАНИЕ ПРИОРИТЕТА
        priority = 3  # default
        confidence_priority = 0.0
        priority_probabilities = {}
        
        if priority_model is not None:
            try:
                priority = int(priority_model.predict([data.description])[0])
                
                if hasattr(priority_model, "predict_proba"):
                    proba = priority_model.predict_proba([data.description])[0]
                    confidence_priority = float(max(proba))
                    priority_probabilities = {
                        f"p{i}": float(prob) for i, prob in enumerate(proba, 1)
                    }
            except Exception as e:
                print(f"⚠️ Priority prediction failed: {e}")
        
        return {
            "category": final_category,
            "priority": priority,
            "confidence_category": confidence_category,
            "confidence_priority": confidence_priority,
            "auto_approved": auto_approved,
            "threshold": THRESHOLD,
            "category_probabilities": category_probabilities,
            "priority_probabilities": priority_probabilities
        }
    
    except Exception as e:
        return {
            "category": "error",
            "priority": 3,
            "confidence_category": 0.0,
            "confidence_priority": 0.0,
            "error": str(e)
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
        "category_model_loaded": category_model is not None,
        "priority_model_loaded": priority_model is not None,
        "category_model_path": CATEGORY_MODEL_PATH,
        "priority_model_path": PRIORITY_MODEL_PATH,
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