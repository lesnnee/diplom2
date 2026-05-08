import pickle
import os

# путь к модели
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "ml_model.pkl"
)

# загрузка pipeline
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

print("✅ Model loaded")

while True:
    text = input("\nTicket: ")

    if text.lower() == "exit":
        break

    prediction = model.predict([text])[0]
    probabilities = model.predict_proba([text])[0]
    classes = model.classes_

    print("\n📌 Prediction:", prediction)

    print("\n📊 Probabilities:")

    for label, prob in zip(classes, probabilities):
        print(f"{label}: {prob * 100:.2f}%")