# Crop Recommendation System

This is a full-stack web application that recommends the best crop to grow based on environmental factors. It uses a machine learning model to provide accurate predictions, helping farmers make informed decisions for sustainable and productive agriculture.

## Features

-   **Crop Recommendation:** Predicts the most suitable crop based on soil and environmental conditions.
-   **User-Friendly Interface:** A simple and intuitive web interface for easy data input.
-   **Real-time Predictions:** Get instant crop recommendations.

## Technologies Used

### Backend

-   **Flask:** A lightweight Python web framework.
-   **scikit-learn:** For machine learning tasks, including data preprocessing.
-   **XGBoost:** For the crop recommendation model.
-   **Flask-CORS:** To handle Cross-Origin Resource Sharing.

### Frontend

-   **React:** A JavaScript library for building user interfaces.
-   **Vite:** A fast build tool for modern web development.
-   **Axios:** For making HTTP requests to the backend.
-   **Tailwind CSS:** For styling the user interface.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Python 3.x
-   Node.js and npm

### Installation

1.  **Clone the repo:**
    ```sh
    git clone https://your-repository-url.com/Crop_Recommandation_System.git
    cd Crop_Recommandation_System
    ```

2.  **Set up the backend:**
    ```sh
    # Create and activate a virtual environment (optional but recommended)
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

    # Install Python dependencies
    pip install -r requirements.txt
    ```

3.  **Set up the frontend:**
    ```sh
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start the backend server:**
    ```sh
    # From the project root directory
    python app.py
    ```
    The Flask server will start on `http://localhost:5000`.

2.  **Start the frontend development server:**
    ```sh
    # From the frontend directory
    cd frontend
    npm run dev
    ```
    The React app will open in your browser at `http://localhost:5173`.

## Usage

1.  Open the web application in your browser.
2.  Fill in the form with the following details:
    -   Temperature
    -   Humidity
    -   Rainfall
    -   PH
    -   Nitrogen, Phosphorous, and Potassium levels
    -   Carbon content
    -   Soil type
3.  Click the **Predict Crop** button to see the recommended crop.

## Project Structure

```
Crop_Recommandation_System/
├── backend/
│   ├── app.py                  # Flask application
│   ├── best_model.pkl          # Pre-trained XGBoost model
│   ├── scaler.pkl              # StandardScaler for data preprocessing
│   ├── o_encoder.pkl           # OrdinalEncoder for categorical features
│   ├── label_classes.pkl       # Decodes prediction to string label
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Home.jsx        # Main React component
│   │   └── App.jsx             # Main app component
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
└── README.md                   # This file
```
