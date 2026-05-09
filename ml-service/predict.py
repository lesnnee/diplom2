import pickle
import os
import sys
import json
import numpy as np

# =====================
# КЛАСС ДОЛЖЕН БЫТЬ ТАКИМ ЖЕ, КАК ПРИ СОХРАНЕНИИ!
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
# LOAD MODEL
# =====================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ml_model_advanced.pkl")

if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(BASE_DIR, "ml_model.pkl")

print(f"Loading model from: {MODEL_PATH}", file=sys.stderr)

try:
    with open(MODEL_PATH, "rb") as f:
        model_data = pickle.load(f)
        
        if isinstance(model_data, dict) and 'model' in model_data:
            model = model_data['model']
        else:
            model = model_data
    
    print("Model loaded successfully!", file=sys.stderr)
    
except Exception as e:
    print(json.dumps({"error": f"Failed to load model: {str(e)}"}), ensure_ascii=False)
    sys.exit(1)

# =====================
# PREDICT
# =====================
if len(sys.argv) < 2:
    print(json.dumps({"error": "No text provided"}), ensure_ascii=False)
    sys.exit(1)

text = sys.argv[1]

try:
    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    classes = model.classes_
    max_prob = max(probabilities)
    
    THRESHOLD = 0.90
    
    if max_prob < THRESHOLD:
        final_prediction = "manual_review"
        auto_approved = False
    else:
        final_prediction = prediction
        auto_approved = True
    
    result = {
        "text": text,
        "category": final_prediction,
        "confidence": round(float(max_prob), 4),
        "auto_approved": auto_approved,
        "probabilities": {
            label: round(float(prob), 4)
            for label, prob in zip(classes, probabilities)
        }
    }
    
    print(json.dumps(result, ensure_ascii=False))
    
except Exception as e:
    print(json.dumps({"error": f"Prediction failed: {str(e)}"}), ensure_ascii=False)
    sys.exit(1)