import json
import pickle
import os

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report


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


# =====================
# 2. SPLIT DATA (ВАЖНО: stratify!)
# =====================
X_train, X_test, y_train, y_test = train_test_split(
    texts,
    labels,
    test_size=0.2,
    random_state=42,
    stratify=labels
)


# =====================
# 3. MODEL PIPELINE
# =====================
model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            ngram_range=(1, 2),   # 👈 важно: учитываем пары слов
            lowercase=True,
            max_features=5000
        )
    ),
    (
        "clf",
        LogisticRegression(
            max_iter=1000,
            class_weight="balanced"  # 👈 важно при дисбалансе классов
        )
    )
])


# =====================
# 4. TRAIN
# =====================
print("\n🚀 Training model...")
model.fit(X_train, y_train)


# =====================
# 5. EVALUATION
# =====================
print("\n📊 Evaluation:\n")

preds = model.predict(X_test)

print(classification_report(y_test, preds))


# =====================
# 6. SAVE MODEL
# =====================
MODEL_PATH = os.path.join(BASE_DIR, "ml_model.pkl")

with open(MODEL_PATH, "wb") as f:
    pickle.dump(model, f)

print("\n✅ Model saved to:", MODEL_PATH)