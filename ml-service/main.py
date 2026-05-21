from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import pandas as pd
import pickle
import os
import json
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

app = FastAPI()

# =====================
# ПУТИ К ФАЙЛАМ
# =====================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Модели
CATEGORY_MODEL_PATH = os.path.join(BASE_DIR, "ml_model_simple.pkl")
PRIORITY_MODEL_PATH = os.path.join(BASE_DIR, "ml_model_priority.pkl")

# Feedback данные (JSON формат)
FEEDBACK_DIR = os.path.join(BASE_DIR, "feedback")
FEEDBACK_CATEGORY_PATH = os.path.join(FEEDBACK_DIR, "feedback_category.json")
FEEDBACK_PRIORITY_PATH = os.path.join(FEEDBACK_DIR, "feedback_priority.json")
COUNTER_PATH = os.path.join(FEEDBACK_DIR, "counter.json")

# Настройки автообучения
AUTO_TRAIN_THRESHOLD = 100

# =====================
# ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
# =====================
category_model = None
priority_model = None

# =====================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# =====================
def ensure_dirs():
    os.makedirs(FEEDBACK_DIR, exist_ok=True)

def load_feedback_data(filepath):
    """Загрузить feedback из JSON файла"""
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_feedback_data(filepath, data):
    """Сохранить feedback в JSON файл"""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_counter():
    """Получить счётчик накопленных feedback"""
    if os.path.exists(COUNTER_PATH):
        with open(COUNTER_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("category", 0), data.get("priority", 0)
    return 0, 0

def increment_counter(field):
    """Увеличить счётчик"""
    category_count, priority_count = get_counter()
    
    if field == "category":
        category_count += 1
    else:
        priority_count += 1
    
    with open(COUNTER_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "category": category_count,
            "priority": priority_count,
            "last_updated": datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)
    
    return category_count, priority_count

def reset_counter():
    """Сбросить счётчик после переобучения"""
    with open(COUNTER_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "category": 0,
            "priority": 0,
            "last_updated": datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)

def retrain_category_model():
    """Переобучение модели категорий на feedback данных"""
    feedback_data = load_feedback_data(FEEDBACK_CATEGORY_PATH)
    
    if len(feedback_data) < AUTO_TRAIN_THRESHOLD:
        return None, f"Need {AUTO_TRAIN_THRESHOLD} samples, have {len(feedback_data)}"
    
    # Подготовка данных
    texts = [item["description"] for item in feedback_data]
    labels = [item["corrected_category"] for item in feedback_data]
    
    # Обучаем новую модель
    new_model = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.95,
            sublinear_tf=True
        )),
        ("clf", RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            random_state=42,
            class_weight="balanced"
        ))
    ])
    
    new_model.fit(texts, labels)
    
    # Сохраняем новую модель
    with open(CATEGORY_MODEL_PATH, "wb") as f:
        pickle.dump(new_model, f)
    
    return new_model, f"Retrained on {len(feedback_data)} samples"

def retrain_priority_model():
    """Переобучение модели приоритетов на feedback данных"""
    feedback_data = load_feedback_data(FEEDBACK_PRIORITY_PATH)
    
    if len(feedback_data) < AUTO_TRAIN_THRESHOLD:
        return None, f"Need {AUTO_TRAIN_THRESHOLD} samples, have {len(feedback_data)}"
    
    # Подготовка данных
    texts = [item["description"] for item in feedback_data]
    priorities = [item["corrected_priority"] for item in feedback_data]
    
    # Обучаем новую модель
    new_model = Pipeline([
        ("tfidf", TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 3),
            min_df=2,
            max_df=0.95,
            sublinear_tf=True
        )),
        ("clf", RandomForestClassifier(
            n_estimators=300,
            max_depth=30,
            min_samples_split=5,
            class_weight="balanced",
            random_state=42
        ))
    ])
    
    new_model.fit(texts, priorities)
    
    # Сохраняем новую модель
    with open(PRIORITY_MODEL_PATH, "wb") as f:
        pickle.dump(new_model, f)
    
    return new_model, f"Retrained on {len(feedback_data)} samples"

# =====================
# ЗАГРУЗКА МОДЕЛЕЙ
# =====================
def load_models():
    global category_model, priority_model
    
    ensure_dirs()
    
    if os.path.exists(CATEGORY_MODEL_PATH):
        with open(CATEGORY_MODEL_PATH, "rb") as f:
            category_model = pickle.load(f)
        print(f"✅ Category model loaded")
    else:
        print(f"⚠️ Category model not found")
    
    if os.path.exists(PRIORITY_MODEL_PATH):
        with open(PRIORITY_MODEL_PATH, "rb") as f:
            priority_model = pickle.load(f)
        print(f"✅ Priority model loaded")
    else:
        print(f"⚠️ Priority model not found")

load_models()

# =====================
# INPUT SCHEMAS
# =====================
class TicketInput(BaseModel):
    description: str

class CategoryFeedbackInput(BaseModel):
    description: str
    original_category: str
    corrected_category: str
    confidence: float = 0.0

class PriorityFeedbackInput(BaseModel):
    description: str
    original_priority: int
    corrected_priority: int
    confidence: float = 0.0

# =====================
# PREDICT
# =====================
@app.post("/predict")
def predict(data: TicketInput):
    global category_model, priority_model

    if category_model is None:
        return {
            "category": "unknown",
            "priority": 3,
            "predicted_category": "unknown",
            "confidence_category": 0.0,
            "confidence_priority": 0.0,
            "error": "category_model_not_loaded"
        }

    try:
        # Категория
        category = category_model.predict([data.description])[0]
        confidence_category = 0.0
        category_probabilities = {}
        
        if hasattr(category_model, "predict_proba"):
            proba = category_model.predict_proba([data.description])[0]
            confidence_category = float(max(proba))
            category_probabilities = {
                label: float(prob) for label, prob in zip(category_model.classes_, proba)
            }
        
        # Приоритет
        priority = 3
        confidence_priority = 0.0
        priority_probabilities = {}
        
        if priority_model is not None:
            priority = int(priority_model.predict([data.description])[0])
            
            if hasattr(priority_model, "predict_proba"):
                proba = priority_model.predict_proba([data.description])[0]
                confidence_priority = float(max(proba))
                priority_probabilities = {
                    f"p{i}": float(prob) for i, prob in enumerate(proba, 1)
                }
        
        # Пороги
        THRESHOLD_CATEGORY = 0.90
        THRESHOLD_PRIORITY = 0.70
        
        # Авто-одобрение только если ОБА порога пройдены
        auto_approved = (confidence_category >= THRESHOLD_CATEGORY) and (confidence_priority >= THRESHOLD_PRIORITY)
        
        final_category = category if auto_approved else "manual_review"
        
        return {
            "category": final_category,
            "predicted_category": category,
            "priority": priority,
            "confidence_category": confidence_category,
            "confidence_priority": confidence_priority,
            "auto_approved": auto_approved,
            "threshold_category": THRESHOLD_CATEGORY,
            "threshold_priority": THRESHOLD_PRIORITY,
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

# =====================
# FEEDBACK КАТЕГОРИИ
# =====================
@app.post("/feedback/category")
def feedback_category(data: CategoryFeedbackInput):
    ensure_dirs()
    
    # Загружаем существующий feedback
    feedback_data = load_feedback_data(FEEDBACK_CATEGORY_PATH)
    
    # Добавляем новый
    feedback_data.append({
        "description": data.description,
        "original_category": data.original_category,
        "corrected_category": data.corrected_category,
        "confidence": data.confidence,
        "timestamp": datetime.now().isoformat()
    })
    
    # Сохраняем
    save_feedback_data(FEEDBACK_CATEGORY_PATH, feedback_data)
    
    # Увеличиваем счётчик
    cat_count, pri_count = increment_counter("category")
    
    return {
        "message": "Category feedback saved",
        "total_feedback": len(feedback_data),
        "pending_for_retrain": cat_count,
        "auto_train_threshold": AUTO_TRAIN_THRESHOLD,
        "ready_for_retrain": cat_count >= AUTO_TRAIN_THRESHOLD
    }

# =====================
# FEEDBACK ПРИОРИТЕТА
# =====================
@app.post("/feedback/priority")
def feedback_priority(data: PriorityFeedbackInput):
    ensure_dirs()
    
    # Загружаем существующий feedback
    feedback_data = load_feedback_data(FEEDBACK_PRIORITY_PATH)
    
    # Добавляем новый
    feedback_data.append({
        "description": data.description,
        "original_priority": data.original_priority,
        "corrected_priority": data.corrected_priority,
        "confidence": data.confidence,
        "timestamp": datetime.now().isoformat()
    })
    
    # Сохраняем
    save_feedback_data(FEEDBACK_PRIORITY_PATH, feedback_data)
    
    # Увеличиваем счётчик
    cat_count, pri_count = increment_counter("priority")
    
    return {
        "message": "Priority feedback saved",
        "total_feedback": len(feedback_data),
        "pending_for_retrain": pri_count,
        "auto_train_threshold": AUTO_TRAIN_THRESHOLD,
        "ready_for_retrain": pri_count >= AUTO_TRAIN_THRESHOLD
    }

# =====================
# RETRAIN (категории)
# =====================
@app.post("/retrain/category")
def retrain_category():
    global category_model
    
    new_model, message = retrain_category_model()
    
    if new_model is not None:
        category_model = new_model
        cat_count, _ = get_counter()
        return {
            "success": True,
            "message": message,
            "old_feedback_cleared": cat_count
        }
    
    return {
        "success": False,
        "message": message
    }

# =====================
# RETRAIN (приоритеты)
# =====================
@app.post("/retrain/priority")
def retrain_priority():
    global priority_model
    
    new_model, message = retrain_priority_model()
    
    if new_model is not None:
        priority_model = new_model
        _, pri_count = get_counter()
        return {
            "success": True,
            "message": message,
            "old_feedback_cleared": pri_count
        }
    
    return {
        "success": False,
        "message": message
    }

# =====================
# RETRAIN (оба)
# =====================
@app.post("/retrain/all")
def retrain_all(background_tasks: BackgroundTasks):
    global category_model, priority_model
    
    results = {
        "category": {"success": False, "message": ""},
        "priority": {"success": False, "message": ""}
    }
    
    # Переобучаем категории
    new_cat_model, cat_msg = retrain_category_model()
    if new_cat_model is not None:
        category_model = new_cat_model
        results["category"] = {"success": True, "message": cat_msg}
    
    # Переобучаем приоритеты
    new_pri_model, pri_msg = retrain_priority_model()
    if new_pri_model is not None:
        priority_model = new_pri_model
        results["priority"] = {"success": True, "message": pri_msg}
    
    # Сбрасываем счётчики
    reset_counter()
    
    return {
        "success": True,
        "results": results,
        "timestamp": datetime.now().isoformat()
    }

# =====================
# HEALTH CHECK
# =====================
@app.get("/health")
def health():
    cat_count, pri_count = get_counter()
    
    return {
        "status": "ok",
        "category_model_loaded": category_model is not None,
        "priority_model_loaded": priority_model is not None,
        "feedback_category_count": len(load_feedback_data(FEEDBACK_CATEGORY_PATH)),
        "feedback_priority_count": len(load_feedback_data(FEEDBACK_PRIORITY_PATH)),
        "pending_retrain_category": cat_count,
        "pending_retrain_priority": pri_count,
        "auto_train_threshold": AUTO_TRAIN_THRESHOLD
    }

# =====================
# STATS
# =====================
@app.get("/stats")
def stats():
    category_feedback = load_feedback_data(FEEDBACK_CATEGORY_PATH)
    priority_feedback = load_feedback_data(FEEDBACK_PRIORITY_PATH)
    cat_count, pri_count = get_counter()
    
    # Анализ исправлений по категориям
    category_corrections = {}
    for item in category_feedback:
        orig = item.get("original_category", "unknown")
        corr = item.get("corrected_category", "unknown")
        key = f"{orig} → {corr}"
        category_corrections[key] = category_corrections.get(key, 0) + 1
    
    # Анализ исправлений по приоритетам
    priority_corrections = {}
    for item in priority_feedback:
        orig = item.get("original_priority", 0)
        corr = item.get("corrected_priority", 0)
        key = f"P{orig} → P{corr}"
        priority_corrections[key] = priority_corrections.get(key, 0) + 1
    
    return {
        "feedback": {
            "category": {
                "total": len(category_feedback),
                "pending_retrain": cat_count,
                "corrections": category_corrections
            },
            "priority": {
                "total": len(priority_feedback),
                "pending_retrain": pri_count,
                "corrections": priority_corrections
            }
        },
        "auto_train_threshold": AUTO_TRAIN_THRESHOLD
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)