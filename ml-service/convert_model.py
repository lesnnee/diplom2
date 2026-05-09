import pickle
import os
import numpy as np

# =====================
# КЛАСС ДОЛЖЕН БЫТЬ ОПРЕДЕЛЕН ДО ЗАГРУЗКИ
# =====================
class PostprocessingClassifier:
    def __init__(self, model):
        self.model = model
        self.classes_ = model.classes_
    
    def _check_network_rules(self, text):
        keywords = ["wi-fi", "вайфай", "роутер", "модем", "точка доступа", "vpn", "впн", "туннель"]
        return any(kw in text for kw in keywords)
    
    def _check_infrastructure_rules(self, text):
        keywords = ["сервер", "сервак", "бд", "база данны", "кластер", "прод", "kubernetes", "k8s", "docker"]
        return any(kw in text for kw in keywords)
    
    def _check_software_rules(self, text):
        keywords = ["приложени", "программ", "софт", "экспорт", "вылетает", "краш", "1с", "битрикс", "jira"]
        return any(kw in text for kw in keywords)
    
    def _check_hardware_rules(self, text):
        keywords = ["ноут", "клавиатур", "мышь", "монитор", "экран", "usb", "батаре", "вентилятор", "включается"]
        return any(kw in text for kw in keywords)
    
    def _check_security_rules(self, text):
        keywords = ["вирус", "взлом", "хак", "фишинг", "троян", "антивирус", "фаервол", "двухфакторная", "сертификат"]
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
# КОНВЕРТАЦИЯ
# =====================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ml_model_advanced.pkl")
NEW_MODEL_PATH = os.path.join(BASE_DIR, "ml_model_simple.pkl")

print(f"Loading model from: {MODEL_PATH}")

# Загружаем модель с классом
with open(MODEL_PATH, "rb") as f:
    model_data = pickle.load(f)

print(f"Loaded type: {type(model_data)}")

# Извлекаем базовую модель
if isinstance(model_data, dict) and 'model' in model_data:
    print("Model is dict with 'model' key")
    wrapped_model = model_data['model']
    
    # Если это PostprocessingClassifier, достаем внутреннюю модель
    if hasattr(wrapped_model, 'model'):
        print("Unwrapping PostprocessingClassifier...")
        final_model = wrapped_model.model
    else:
        final_model = wrapped_model
else:
    print("Model is direct object")
    final_model = model_data

print(f"Final model type: {type(final_model)}")

# Сохраняем простую модель
with open(NEW_MODEL_PATH, "wb") as f:
    pickle.dump(final_model, f)

print(f"✅ Simple model saved to: {NEW_MODEL_PATH}")

# Тестируем
print("\n🔮 Testing loaded model...")
test_text = "vpn не подключается"
pred = final_model.predict([test_text])[0]
print(f"   '{test_text}' → {pred}")

if hasattr(final_model, 'predict_proba'):
    proba = final_model.predict_proba([test_text])[0]
    print(f"   Confidence: {max(proba):.2%}")