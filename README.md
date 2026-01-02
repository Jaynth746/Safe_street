# Safe Street 🛣️

An AI-powered road damage detection system built for the hackathon.

## System Architecture
*   **Mobile App**: React Native (Expo)
*   **Backend API**: Python (FastAPI)
*   **AI Engine**: Google ViT (Vision Transformer) via Hugging Face

---

## 🚀 Quick Start

### 1. Start the Backend Server
The backend handles image analysis and email reporting.

**Open Terminal 1:**
```bash
cd backend

# Install Python dependencies (first time only)
pip3 install -r requirements.txt

# Start the server
python3 main.py
```
> Server runs on: `http://0.0.0.0:8000`

### 2. Start the Mobile App
The mobile app allows users to upload images for analysis.

**Open Terminal 2:**
```bash
cd mobile

# Install Node dependencies (first time only)
npm install

# Start the app
npx expo start --clear
```

**How to Run on Device:**
*   **iOS Simulator**: Press `i` in the terminal.
*   **Android Emulator**: Press `a` in the terminal.
*   **Physical Device**:
    1.  Download the **Expo Go** app on your phone.
    2.  Scan the QR code shown in the terminal.
    3.  *Note:* Ensure your phone and computer are on the same Wi-Fi.

---

## 🔧 Troubleshooting

### "Network Error" or "Could not connect"
*   **On Emulator**: It should just work (connects to `10.0.2.2`).
*   **On Real Phone**: The app needs your computer's local IP address.
    1.  Find your IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows).
    2.  Update `mobile/App.js`:
        ```javascript
        const API_CONFIG = {
          baseUrl: 'http://YOUR_IP_ADDRESS:8000', 
          // ...
        }
        ```
    3.  Restart Expo: `npx expo start --clear`.

### "No Image Selected" on Web
*   The web version requires the backend to be running and accessible at `localhost:8000`.
*   Ensure you allowed CORS in `backend/main.py` (enabled by default).
