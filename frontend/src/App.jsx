import { useState } from 'react';
import axios from 'axios';

const App = () => {
    const [formData, setFormData] = useState({
        Temperature: '',
        Humidity: '',
        Rainfall: '',
        PH: '',
        Nitrogen: '',
        Phosphorous: '',
        Potassium: '',
        Carbon: '',
        Soil: '',
    });

    const [prediction, setPrediction] = useState('');

    const soilOptions = [
        "Clay", "Sandy", "Loamy", "Silty", "Peaty", "Chalky"
        // Add all soil types from your dataset if there are more
    ];

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/predict', formData);
            setPrediction(res.data.predicted_crop);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Crop Prediction</h1>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
                {Object.keys(formData).filter(key => key !== 'Soil').map((key) => (
                    <input
                        key={key}
                        type="number"
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        placeholder={key}
                        required
                    />
                ))}

                {/* Soil Dropdown */}
                <select name="Soil" value={formData.Soil} onChange={handleChange} required>
                    <option value="">Select Soil Type</option>
                    {soilOptions.map((soil, idx) => (
                        <option key={idx} value={soil}>{soil}</option>
                    ))}
                </select>

                <button type="submit" style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none' }}>
                    Predict Crop
                </button>
            </form>

            {prediction && (
                <div style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>
                    <strong>Predicted Crop:</strong> {prediction}
                </div>
            )}
        </div>
    );
};

export default App;
