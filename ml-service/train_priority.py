import json
import pickle
import os
import numpy as np
from collections import Counter
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix

# =====================
# ПУТИ
# =====================
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
DATASET_PATH = os.path.join(BACKEND_DIR, "dataset_with_priority.json")
MODEL_PATH = os.path.join(BASE_DIR, "ml_model_priority.pkl")

print("📂 Загрузка датасета из:", DATASET_PATH)

# =====================
# 1. ЗАГРУЗКА ДАННЫХ
# =====================
with open(DATASET_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

texts = [item["text"] for item in data]
priorities = [item["priority"] for item in data]
categories = [item["category"] for item in data]

print(f"✅ Загружено {len(texts)} записей")

# =====================
# 2. СТАТИСТИКА
# =====================
print("\n📊 Распределение приоритетов:")
priority_counts = Counter(priorities)
for p in range(1, 6):
    count = priority_counts.get(p, 0)
    print(f"   Priority {p}: {count} ({count/len(texts)*100:.1f}%)")

# =====================
# 3. РАЗДЕЛЕНИЕ
# =====================
X_train, X_test, y_train, y_test = train_test_split(
    texts, priorities,
    test_size=0.2,
    random_state=42,
    stratify=priorities
)

print(f"\n📊 Train: {len(X_train)}, Test: {len(X_test)}")

# =====================
# 4. ОБУЧЕНИЕ
# =====================
print("\n🚀 Обучение модели приоритетов...")

priority_model = Pipeline([
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
        random_state=42,
        n_jobs=-1
    ))
])

priority_model.fit(X_train, y_train)

# =====================
# 5. ОЦЕНКА
# =====================
print("\n📊 Результаты:\n")
y_pred = priority_model.predict(X_test)

target_names = [f"Priority {i} (Critical {i==1})" for i in range(1, 6)]
print(classification_report(y_test, y_pred, target_names=target_names))

# Матрица ошибок
cm = confusion_matrix(y_test, y_pred)
print("\n📊 Матрица ошибок:")
print("        Pred→  P1   P2   P3   P4   P5")
for i, priority in enumerate(range(1, 6)):
    row = cm[i]
    print(f"True P{priority} → " + " ".join(f"{x:4d}" for x in row))

# Точность по каждому приоритету
print("\n📊 Точность по приоритетам:")
for i, priority in enumerate(range(1, 6)):
    correct = cm[i][i]
    total = sum(cm[i])
    acc = correct/total*100 if total > 0 else 0
    print(f"   Priority {priority}: {correct}/{total} = {acc:.1f}%")

# =====================
# 6. СОХРАНЕНИЕ
# =====================
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
with open(MODEL_PATH, "wb") as f:
    pickle.dump(priority_model, f)

print(f"\n💾 Модель сохранена: {MODEL_PATH}")

# =====================
# 7. ТЕСТ
# =====================
print("\n🔮 Тестирование на примерах:")

test_examples = [
    "весь отдел бухгалтерии не может сдать отчет, работа встала",
    "ноутбук немного тормозит, но работать можно",
    "как подключить принтер к компьютеру?",
    "сервер с клиентами упал, продажи остановлены",
    "надоело окно с ошибкой, но всё работает"
]

for text in test_examples:
    pred = priority_model.predict([text])[0]
    print(f"\n📝 {text}")
    print(f"   🏷️ Приоритет: {pred}")