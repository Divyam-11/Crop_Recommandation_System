from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
# Assuming you have these scikit-learn classes installed
from sklearn.preprocessing import StandardScaler, OrdinalEncoder
import traceback # For better error logging

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# --- Load Preprocessing Objects and Model ---
try:
    # Load the saved model
    model = pickle.load(open('best_model.pkl', 'rb')) # Your best XGBoost model

    # Load the fitted scaler
    scaler = pickle.load(open('scaler.pkl', 'rb')) # Assuming saved StandardScaler

    # Load the fitted ordinal encoder for 'Soil'
    o_encoder = pickle.load(open('o_encoder.pkl', 'rb')) # Assuming saved OrdinalEncoder

    # Load the label classes for decoding the prediction
    with open('label_classes.pkl', 'rb') as f:
        label_classes = pickle.load(f) # Decodes prediction to english string label

except FileNotFoundError as e:
    print(f"Error loading necessary file: {e}. Make sure 'best_model.pkl', 'scaler.pkl', 'o_encoder.pkl', and 'label_classes.pkl' exist.")
    # Exit or handle appropriately if files are missing
    exit()
except Exception as e:
    print(f"An error occurred during loading: {e}")
    traceback.print_exc()
    exit()


# Define the order of numerical features used during training for the scaler
numerical_features = ['Temperature', 'Humidity', 'Rainfall', 'PH', 'Nitrogen', 'Phosphorous', 'Potassium', 'Carbon']
# Define the categorical feature(s) - only 'Soil' in this case
categorical_features = ['Soil']

# Define the order of all features AS EXPECTED BY THE MODEL after preprocessing
# Typically, this matches the column order in the DataFrame used for training *after* transformations
# Assuming numerical features came first, then the encoded categorical feature
model_feature_order = numerical_features + categorical_features # Order matters!


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from POST request (expected JSON)
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400

        # --- Data Validation and Extraction ---
        # Check if all required features are present
        required_features = numerical_features + categorical_features
        missing_features = [feat for feat in required_features if feat not in data]
        if missing_features:
            return jsonify({'error': f'Missing features: {", ".join(missing_features)}'}), 400

        # Extract features, ensuring numerical types for numerical features
        try:
            numerical_values = [float(data[feat]) for feat in numerical_features]
            soil_value = data['Soil'] # Keep as string for now
        except ValueError as e:
            return jsonify({'error': f'Invalid data type for numerical features. Check input. Details: {e}'}), 400
        except KeyError as e:
            # This check is redundant due to missing_features check above, but good practice
            return jsonify({'error': f'Missing feature in input data: {e}'}), 400


        # --- Preprocessing - Mimic Training Steps ---

        # 1. Encode 'Soil' using the loaded OrdinalEncoder
        try:
            # OrdinalEncoder expects a 2D array-like input
            soil_array = np.array([[soil_value]])
            soil_encoded = o_encoder.transform(soil_array)
            # Extract the scalar encoded value
            soil_encoded_scalar = soil_encoded[0, 0]
        except ValueError as e:
            # Handle cases where the soil type wasn't seen during training
            return jsonify({'error': f'Unknown soil type: "{soil_value}". Encoder error: {e}'}), 400
        except Exception as e:
            print(f"Error during soil encoding: {e}")
            traceback.print_exc()
            return jsonify({'error': 'Internal server error during soil encoding'}), 500


        # 2. Scale Numerical Features using the loaded StandardScaler
        try:
            # StandardScaler expects a 2D array [n_samples, n_features]
            numerical_array = np.array([numerical_values]) # Reshape to (1, num_numerical_features)
            numerical_scaled = scaler.transform(numerical_array)
            # Keep it as a 1D array for concatenation
            numerical_scaled_1d = numerical_scaled[0]
        except Exception as e:
            print(f"Error during numerical scaling: {e}")
            traceback.print_exc()
            return jsonify({'error': 'Internal server error during numerical scaling'}), 500


        # 3. Combine features in the correct order for the model
        # Ensure this order matches exactly how the model was trained!
        # Assuming the order was: scaled numerical features, then encoded soil feature
        try:
            # Combine the scaled numerical features and the encoded soil feature
            # Convert soil_encoded_scalar to a list or 1-element array for concatenation
            feature_vector = np.concatenate((numerical_scaled_1d, [soil_encoded_scalar]))

            # Reshape for the model prediction (expects 2D array: [n_samples, n_features])
            final_features = feature_vector.reshape(1, -1)
        except Exception as e:
            print(f"Error combining features: {e}")
            traceback.print_exc()
            return jsonify({'error': 'Internal server error during feature combination'}), 500


        # --- Prediction ---
        try:
            prediction_encoded = model.predict(final_features)
            # prediction_encoded will likely be an array like [5], get the scalar value
            predicted_index = int(prediction_encoded[0])

            # Decode the prediction using label_classes
            if 0 <= predicted_index < len(label_classes):
                predicted_label = label_classes[predicted_index]
            else:
                # Handle unexpected prediction index
                return jsonify({'error': f'Model produced an invalid prediction index: {predicted_index}'}), 500

        except Exception as e:
            print(f"Error during model prediction or decoding: {e}")
            traceback.print_exc()
            return jsonify({'error': 'Internal server error during prediction'}), 500

        # --- Return Response ---
        return jsonify({'predicted_crop': predicted_label})

    except Exception as e:
        # Catch any other unexpected errors
        print(f"An unexpected error occurred in /predict endpoint: {e}")
        traceback.print_exc()
        return jsonify({'error': 'An unexpected internal server error occurred'}), 500


if __name__ == '__main__':
    # Run the Flask app
    # debug=True is useful for development but should be False in production
    app.run(debug=True, host='0.0.0.0', port=5000) # Example: run on port 5000, accessible externally