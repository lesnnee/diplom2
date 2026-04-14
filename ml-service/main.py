from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
from model import train_model, load_model

app = FastAPI()

MODEL_PATH = "model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"
new_data_counter = 0
AUTO_TRAIN_THRESHOLD = 10


class TicketInput(BaseModel):
    description: str


class TrainInput(BaseModel):
    description: str
    category: str
    priority: int


# загрузка модели
model, vectorizer = load_model()


@app.post("/predict")
def predict(data: TicketInput):
    global model, vectorizer

    if model is None:
        return {"category": "unknown", "priority": 3}

    X = vectorizer.transform([data.description])
    category = model.predict(X)[0]

    return {
        "category": category,
        "priority": 2
    }


@app.post("/feedback")
def feedback(data: TrainInput):
    df = pd.read_csv("dataset.csv")

    new_row = pd.DataFrame([{
        "description": data.description,
        "category": data.category,
        "priority": data.priority
    }])

    df = pd.concat([df, new_row], ignore_index=True)
    df.to_csv("dataset.csv", index=False)

    return {"message": "saved to dataset"}


@app.post("/feedback")
def feedback(data: TrainInput):
    global new_data_counter, model, vectorizer

    df = pd.read_csv("dataset.csv")

    new_row = pd.DataFrame([{
        "description": data.description,
        "category": data.category,
        "priority": data.priority
    }])

    df = pd.concat([df, new_row], ignore_index=True)
    df.to_csv("dataset.csv", index=False)

    new_data_counter += 1

    # 🔥 AUTO-TRAINING
    if new_data_counter >= AUTO_TRAIN_THRESHOLD:
        model, vectorizer = train_model()
        new_data_counter = 0

        return {
            "message": "saved + auto-trained model"
        }

    return {"message": "saved to dataset"}