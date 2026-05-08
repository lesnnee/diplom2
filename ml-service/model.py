import pandas as pd
import joblib
import os

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

MODEL_PATH = "model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"


# =========================
# TRAIN MODEL (IMPROVED)
# =========================

def train_model():
    df = pd.read_csv("dataset.csv")

    if len(df) < 10:
        print("Not enough data to train")
        return None, None

    X_train, X_test, y_train, y_test = train_test_split(
        df["description"],
        df["category"],
        test_size=0.2,
        random_state=42,
        stratify=df["category"]
    )

    # =========================
    # VECTORIZER (IMPROVED)
    # =========================
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words="english"
    )

    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # =========================
    # MODEL (IMPROVED)
    # =========================
    model = LogisticRegression(
        max_iter=300,
        class_weight="balanced"
    )

    model.fit(X_train_vec, y_train)

    # =========================
    # EVALUATION
    # =========================
    y_pred = model.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)

    print("=== MODEL EVALUATION ===")
    print(f"Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred))

    # =========================
    # SAVE MODEL ONLY IF VALID
    # =========================
    if acc > 0.6:   # защита от деградации модели
        joblib.dump(model, MODEL_PATH)
        joblib.dump(vectorizer, VECTORIZER_PATH)
        print("Model saved")

        return model, vectorizer

    print("Model NOT saved (low accuracy)")
    return None, None


# =========================
# LOAD MODEL
# =========================

def load_model():
    try:
        if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
            return None, None

        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)

        return model, vectorizer

    except Exception as e:
        print("Load error:", e)
        return None, None