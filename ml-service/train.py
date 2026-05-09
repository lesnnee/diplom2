import json
import pickle
import os
import numpy as np
from collections import Counter

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix

import matplotlib.pyplot as plt

# =====================
# 1. LOAD DATASET
# =====================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "backend", "dataset.json")

print("📂 Loading dataset from:", DATA_PATH)

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

texts = [item["text"] for item in data]
labels = [item["label"] for item in data]

print("📊 Total samples:", len(texts))
print("📊 Unique labels:", set(labels))
print("📊 Unique texts:", len(set(texts)))

# Статистика по категориям
label_counts = Counter(labels)
print("\n📊 Распределение по категориям:")
for label, count in sorted(label_counts.items()):
    print(f"   {label}: {count} ({count/len(labels)*100:.1f}%)")

# =====================
# 2. SPLIT DATA
# =====================
X_train, X_test, y_train, y_test = train_test_split(
    texts,
    labels,
    test_size=0.2,
    random_state=42,
    stratify=labels
)

print(f"\n📊 Train size: {len(X_train)}, Test size: {len(X_test)}")

# =====================
# 3. ВЕКТОРИЗАЦИЯ
# =====================
print("\n🔧 Настройка векторизации...")

tfidf_word = TfidfVectorizer(
    lowercase=True,
    analyzer='word',
    ngram_range=(1, 3),
    min_df=2,
    max_df=0.90,
    sublinear_tf=True,
    stop_words=['это', 'так', 'все', 'уже', 'еще', 'очень', 'просто']
)

tfidf_char = TfidfVectorizer(
    lowercase=True,
    analyzer='char_wb',
    ngram_range=(2, 5),
    min_df=2,
    max_df=0.95,
    sublinear_tf=True
)

# Обучаем векторайзеры
print("   Обучаем векторайзеры...")
tfidf_word.fit(X_train)
tfidf_char.fit(X_train)

# =====================
# 4. POSTPROCESSING CLASSIFIER (БЕЗ ЛЯМБД!)
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
        """Применение правил к одному предсказанию"""
        text_lower = text.lower()
        
        # Получаем уверенность модели
        try:
            probs = self.model.predict_proba([text])[0]
            confidence = max(probs)
        except:
            confidence = 0.5
        
        # Правила для Network
        if self._check_network_rules(text_lower):
            if confidence < 0.75 and prediction != "network":
                return "network"
        
        # Правила для Infrastructure
        if self._check_infrastructure_rules(text_lower):
            if confidence < 0.75 and prediction != "infrastructure":
                return "infrastructure"
        
        # Правила для Software
        if self._check_software_rules(text_lower):
            if confidence < 0.70 and prediction != "software":
                return "software"
        
        # Правила для Hardware
        if self._check_hardware_rules(text_lower):
            if confidence < 0.70 and prediction != "hardware":
                return "hardware"
        
        # Правила для Security
        if self._check_security_rules(text_lower):
            if confidence < 0.75 and prediction != "security":
                return "security"
        
        return prediction
    
    def predict(self, X):
        """Предсказание с постобработкой"""
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
# 5. АНСАМБЛЬ (STACKING)
# =====================
print("\n🚀 Создание ансамбля моделей...")

lr = LogisticRegression(max_iter=1000, class_weight="balanced", C=1.0, random_state=42)
rf = RandomForestClassifier(n_estimators=200, max_depth=30, min_samples_split=5, 
                           min_samples_leaf=2, class_weight="balanced", random_state=42, n_jobs=-1)
nb = MultinomialNB(alpha=0.5)

stacking_clf = StackingClassifier(
    estimators=[
        ('lr', Pipeline([('tfidf', tfidf_word), ('clf', lr)])),
        ('rf', Pipeline([('tfidf', tfidf_char), ('clf', rf)])),
        ('nb', Pipeline([('tfidf', tfidf_word), ('clf', nb)]))
    ],
    final_estimator=LogisticRegression(C=0.5, class_weight="balanced"),
    cv=5,
    stack_method='predict_proba'
)

print("   Используем StackingClassifier...")
ensemble = stacking_clf

# =====================
# 6. TRAIN
# =====================
print("\n🚀 Обучение ансамбля...")
ensemble.fit(X_train, y_train)

# =====================
# 7. ПОСТОБРАБОТКА
# =====================
print("🔧 Добавление постобработки...")
final_model = PostprocessingClassifier(ensemble)

# =====================
# 8. EVALUATION
# =====================
print("\n📊 Оценка модели:\n")

ensemble_preds = ensemble.predict(X_test)
final_preds = final_model.predict(X_test)

print("="*60)
print("БАЗОВЫЙ АНСАМБЛЬ (без постобработки):")
print("="*60)
print(classification_report(y_test, ensemble_preds))

print("\n" + "="*60)
print("ФИНАЛЬНАЯ МОДЕЛЬ (с постобработкой):")
print("="*60)
print(classification_report(y_test, final_preds))

# =====================
# 9. CONFUSION MATRIX
# =====================
print("\n📊 Матрица ошибок:")
cm = confusion_matrix(y_test, final_preds)
labels_sorted = sorted(set(labels))

print("\n   " + " ".join([f"{l[:3]:>4}" for l in labels_sorted]))
for i, label in enumerate(labels_sorted):
    row = cm[i]
    print(f"   {label[:3]:>3} " + " ".join([f"{x:4d}" for x in row]))

# Сохраняем confusion matrix
try:
    plt.figure(figsize=(10, 8))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Confusion Matrix')
    plt.colorbar()
    tick_marks = np.arange(len(labels_sorted))
    plt.xticks(tick_marks, labels_sorted, rotation=45)
    plt.yticks(tick_marks, labels_sorted)
    
    for i in range(len(labels_sorted)):
        for j in range(len(labels_sorted)):
            plt.text(j, i, str(cm[i, j]), ha="center", va="center",
                    color="white" if cm[i, j] > cm.max() / 2 else "black")
    
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(os.path.join(BASE_DIR, 'confusion_matrix.png'), dpi=100)
    print("\n✅ Матрица ошибок сохранена")
except Exception as e:
    print(f"\n   (визуализация не сохранена: {e})")

# =====================
# 10. SAVE MODEL (ФИКСИРОВАННЫЙ!)
# =====================
MODEL_PATH = os.path.join(BASE_DIR, "ml_model_advanced.pkl")

print(f"\n💾 Сохранение модели в: {MODEL_PATH}")

model_data = {
    'model': final_model,
    'classes': ensemble.classes_,
    'metadata': {
        'train_size': len(X_train),
        'test_size': len(X_test),
        'features_count': len(tfidf_word.get_feature_names_out()),
        'accuracy': classification_report(y_test, final_preds, output_dict=True)['accuracy'],
        'label_counts': dict(label_counts)
    }
}

# Сохраняем с протоколом 4 для лучшей совместимости
with open(MODEL_PATH, "wb") as f:
    pickle.dump(model_data, f, protocol=4)

print("✅ Модель успешно сохранена!")
print(f"   - Тип: Stacking Ensemble + Postprocessing (без lambda)")
print(f"   - Точность: {model_data['metadata']['accuracy']:.2%}")

# =====================
# 11. QUICK TEST
# =====================
print("\n🔮 БЫСТРЫЙ ТЕСТ:")

test_examples = [
    "vpn не подключается",
    "ноутбук перегревается",
    "сервер недоступен",
    "антивирус блокирует программу",
    "приложение вылетает"
]

for example in test_examples:
    pred = final_model.predict([example])[0]
    probs = final_model.predict_proba([example])[0]
    confidence = max(probs)
    print(f"   '{example}' → {pred} ({confidence:.2%})")

print("\n✅ Готово! Теперь можно использовать predict.py")