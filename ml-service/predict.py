import pickle
import os
import sys
import json
import numpy as np

# =====================
# ПУТИ К МОДЕЛЯМ
# =====================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # C:\diplom2

# Модель категорий
CATEGORY_MODEL_PATH = os.path.join(BASE_DIR, "ml_model_advanced.pkl")
if not os.path.exists(CATEGORY_MODEL_PATH):
    CATEGORY_MODEL_PATH = os.path.join(BASE_DIR, "ml_model.pkl")

# Модель приоритетов
PRIORITY_MODEL_PATH = os.path.join(BASE_DIR, "ml_model_priority.pkl")

print(f"🔍 Category model path: {CATEGORY_MODEL_PATH}", file=sys.stderr)
print(f"🔍 Priority model path: {PRIORITY_MODEL_PATH}", file=sys.stderr)


# =====================
# КЛАСС ДЛЯ POSTPROCESSING
# =====================
class PostprocessingClassifier:
    def __init__(self, model):
        self.model = model
        self.classes_ = model.classes_
    
    def _check_network_rules(self, text):
        keywords = ["wi-fi", "вайфай", "роутер", "модем", "vpn", "впн"]
        return any(kw in text for kw in keywords)
    
    def _check_infrastructure_rules(self, text):
        keywords = ["сервер", "сервак", "бд", "база данны", "кластер", "прод"]
        return any(kw in text for kw in keywords)
    
    def _check_software_rules(self, text):
        keywords = ["приложени", "программ", "софт", "экспорт", "вылетает", "краш"]
        return any(kw in text for kw in keywords)
    
    def _check_hardware_rules(self, text):
        keywords = ["ноут", "клавиатур", "мышь", "монитор", "экран", "usb", "батаре"]
        return any(kw in text for kw in keywords)
    
    def _check_security_rules(self, text):
        keywords = ["вирус", "взлом", "хак", "фишинг", "троян", "антивирус", "фаервол"]
        return any(kw in text for kw in keywords)
    
    def _apply_rules(self, text, prediction):
        text_lower = text.lower()
        
        try:
            probs = self.model.predict_proba([text])[0]
            confidence = max(probs)
        except:
            confidence = 0.5
        
        if self._check_network_rules(text_lower):
            if confidence < 0.75 and prediction != "network":
                return "network"
        if self._check_infrastructure_rules(text_lower):
            if confidence < 0.75 and prediction != "infrastructure":
                return "infrastructure"
        if self._check_software_rules(text_lower):
            if confidence < 0.70 and prediction != "software":
                return "software"
        if self._check_hardware_rules(text_lower):
            if confidence < 0.70 and prediction != "hardware":
                return "hardware"
        if self._check_security_rules(text_lower):
            if confidence < 0.75 and prediction != "security":
                return "security"
        
        return prediction
    
    def predict(self, X):
        base_preds = self.model.predict(X)
        if isinstance(X, str):
            return self._apply_rules(X, base_preds)
        result = []
        for text, pred in zip(X, base_preds):
            result.append(self._apply_rules(text, pred))
        return np.array(result)
    
    def predict_proba(self, X):
        return self.model.predict_proba(X)


# =====================
# ЗАГРУЗКА МОДЕЛЕЙ
# =====================
category_model = None
priority_model = None

def load_models():
    global category_model, priority_model
    
    # Загрузка модели категорий
    if os.path.exists(CATEGORY_MODEL_PATH):
        try:
            with open(CATEGORY_MODEL_PATH, "rb") as f:
                model_data = pickle.load(f)
                if isinstance(model_data, dict) and 'model' in model_data:
                    category_model = model_data['model']
                else:
                    category_model = model_data
            print(f"✅ Category model loaded", file=sys.stderr)
        except Exception as e:
            print(f"❌ Failed to load category model: {e}", file=sys.stderr)
    else:
        print(f"❌ Category model not found: {CATEGORY_MODEL_PATH}", file=sys.stderr)
    
    # Загрузка модели приоритетов
    if os.path.exists(PRIORITY_MODEL_PATH):
        try:
            with open(PRIORITY_MODEL_PATH, "rb") as f:
                priority_model = pickle.load(f)
            print(f"✅ Priority model loaded", file=sys.stderr)
        except Exception as e:
            print(f"❌ Failed to load priority model: {e}", file=sys.stderr)
    else:
        print(f"⚠️ Priority model not found: {PRIORITY_MODEL_PATH}", file=sys.stderr)


# =====================
# ФУНКЦИЯ ДЛЯ КОНВЕРТАЦИИ NUMPY ТИПОВ
# =====================
def convert_to_serializable(obj):
    """Рекурсивно конвертирует numpy типы в стандартные Python типы"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    else:
        return obj


# =====================
# ФУНКЦИЯ ПРЕДСКАЗАНИЯ
# =====================
def predict_full(text):
    """Возвращает и категорию, и приоритет"""
    result = {
        "text": text,
        "category": "unknown",
        "priority": 3,
        "confidence_category": 0.0,
        "confidence_priority": 0.0,
        "auto_approved": False,
        "threshold": 0.90
    }
    
    # 1. Предсказание категории
    if category_model is not None:
        try:
            category = category_model.predict([text])[0]
            probs = category_model.predict_proba([text])[0]
            confidence = max(probs)
            
            THRESHOLD = 0.90
            auto_approved = confidence >= THRESHOLD
            
            result["category"] = category if auto_approved else "manual_review"
            result["confidence_category"] = float(confidence)
            result["auto_approved"] = bool(auto_approved)  # конвертируем в bool
            
            if not auto_approved:
                result["original_category"] = category
            
            # Вероятности категорий
            result["category_probabilities"] = {
                label: float(prob) for label, prob in zip(category_model.classes_, probs)
            }
        except Exception as e:
            print(f"❌ Category prediction failed: {e}", file=sys.stderr)
    
    # 2. Предсказание приоритета
    if priority_model is not None:
        try:
            priority = priority_model.predict([text])[0]
            probs = priority_model.predict_proba([text])[0]
            confidence = max(probs)
            
            result["priority"] = int(priority)
            result["confidence_priority"] = float(confidence)
            
            # Вероятности приоритетов
            result["priority_probabilities"] = {
                f"p{i}": float(prob) for i, prob in enumerate(probs, 1)
            }
        except Exception as e:
            print(f"❌ Priority prediction failed: {e}", file=sys.stderr)
    
    # Конвертируем все numpy типы
    return convert_to_serializable(result)


# =====================
# ЗАГРУЖАЕМ МОДЕЛИ ПРИ СТАРТЕ
# =====================
load_models()


# =====================
# CLI ИНТЕРФЕЙС
# =====================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No text provided"}, ensure_ascii=False))
        sys.exit(1)
    
    text = sys.argv[1]
    result = predict_full(text)
    print(json.dumps(result, ensure_ascii=False, indent=2))