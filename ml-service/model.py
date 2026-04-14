import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib

MODEL_PATH = "model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"


def train_model():
    df = pd.read_csv("dataset.csv")

    if len(df) < 2:
        return None

    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(df["description"])

    model = LogisticRegression(max_iter=200)
    model.fit(X, df["category"])

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)

    return model, vectorizer


def load_model():
    try:
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        return model, vectorizer
    except:
        return None, None