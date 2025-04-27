from flask import Flask, request, jsonify
import pickle
import numpy as np
from flask_cors import CORS

# Create Flask app
app = Flask(__name__)
CORS(app)  # Allow React frontend to connect

# Load the saved model
model = pickle.load(open('best_model.pkl', 'rb'))

# Map Soil types to encoded values (same as you did in training)
soil_mapping = {
    "Clay": 0,
    "Sandy": 1,
    "Loamy": 2,
    "Silty": 3,
    "Peaty": 4,
    "Chalky": 5
    # Update if more soil types
}

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    try:
        # Extract inputs
        Temperature = float(data['Temperature'])
        Humidity = float(data['Humidity'])
        Rainfall = float(data['Rainfall'])
        PH = float(data['PH'])
        Nitrogen = float(data['Nitrogen'])
        Phosphorous = float(data['Phosphorous'])
        Potassium = float(data['Potassium'])
        Carbon = float(data['Carbon'])
        Soil = soil_mapping.get(data['Soil'], 0)  # Default 0 if unknown

        features = np.array([[Temperature, Humidity, Rainfall, PH, Nitrogen, Phosphorous, Potassium, Carbon, Soil]])

        # Predict
        prediction = model.predict(features)[0]

        # If you used label encoding for crops, decode it here.
        # Example: reverse_mapping = {0: 'Rice', 1: 'Wheat', ...}
        reverse_mapping = {
            0: 'Apple', 1: 'Banana', 2: 'Rice', 3: 'Wheat'
            # Fill based on your label encoder!
        }

        crop_name = reverse_mapping.get(prediction, "Unknown")

        return jsonify({'predicted_crop': crop_name})

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
