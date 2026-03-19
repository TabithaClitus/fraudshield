# 🛡️ FraudShield — Real-Time UPI Payment Safety App

> India's AI-powered fraud detection system for safe digital payments. Built for hackathon with Claude Sonnet AI.

---

## ⚡ Quick Start (3 Commands)

```bash
# 1. Start the backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# 2. Start the mobile app (new terminal)
cd mobile && npm install && npx expo start

# 3. Scan QR code with Expo Go app on your phone
```

**Or on Windows, just double-click `run.bat`**

---

## 📱 App Features

### Core Flow
```
Enter Mobile + Amount → AI Scan (2.5s) → SAFE / DANGER / CAUTION → Pay or Block
```

### 5 Screens
| Tab | Feature |
|-----|---------|
| 🏠 **Home** | Enter mobile + amount, instant fraud check with Claude AI |
| 📊 **Dashboard** | Live fraud analytics, charts, recent activity |
| 🗺️ **Heatmap** | India fraud hotspot map with 20 cities |
| 👨‍👩‍👧 **Guardian** | Family protection alerts and monitoring |
| 🤖 **AI Predictor** | Claude AI trending scam predictions |

### Auth Flow
- Login / Signup with email + password
- Session persistence (stay logged in)
- Profile page with user stats
- Forgot password flow

---

## 🔧 Tech Stack

### Frontend (Mobile)
- **React Native** + **Expo** (managed workflow)
- **expo-router** for navigation
- **Moti** + **Reanimated** for animations
- **Victory Native** for charts
- **react-native-svg** for RiskMeter gauge
- **expo-speech** for voice alerts
- **expo-haptics** for danger vibration

### Backend
- **FastAPI** (Python)
- **Claude Sonnet API** (claude-sonnet-4-20250514) for AI analysis
- **JSON file** for mock scam data (no DB needed)

---

## 🤖 AI-Powered Features

1. **Transaction Analysis** — Claude analyzes mobile + amount + note for fraud patterns
2. **Scam Predictions** — Claude generates real-time trending scam alerts for Indian cities
3. **Voice Alert** — expo-speech speaks danger warnings on HIGH risk
4. **Haptic Feedback** — Device vibrates on fraud detection

---

## 📂 Project Structure

```
fraudshield/
├── frontend/          # React web app (alternative)
├── backend/
│   ├── main.py        # FastAPI with Claude API integration
│   └── requirements.txt
├── mobile/
│   ├── app/
│   │   ├── _layout.jsx        # Root layout + auth gate
│   │   ├── login.jsx          # Login screen
│   │   ├── signup.jsx         # Signup screen
│   │   ├── forgot-password.jsx
│   │   ├── profile.jsx        # User profile
│   │   ├── result.jsx         # Risk result screen
│   │   └── (tabs)/
│   │       ├── index.jsx      # Home — payment checker
│   │       ├── dashboard.jsx  # Analytics
│   │       ├── heatmap.jsx    # India fraud map
│   │       ├── guardian.jsx   # Family protection
│   │       └── predictor.jsx  # AI predictions
│   ├── components/
│   │   ├── RiskMeter.jsx      # Animated SVG gauge
│   │   └── ScanAnimation.jsx  # Scanning screen
│   ├── hooks/
│   │   ├── useAuth.js         # Auth with AsyncStorage
│   │   └── useFraudCheck.js   # API calls + mock fallbacks
│   └── constants/
│       └── theme.js           # Dark theme colors
└── data/
    └── scam_data.json         # 20 Indian city scam data
```

---

## 📲 Testing on Phone

1. Install **Expo Go** from Play Store / App Store
2. Run `npx expo start` in the `mobile/` folder
3. Scan the QR code shown in terminal

### Demo Scenarios (pre-loaded)
| Scenario | Expected Result |
|----------|----------------|
| ✅ Safe (9876543210) | Risk 12 — SAFE |
| ⛔ Scammer (9999988888) | Risk 91 — DANGER |
| ⚠️ Suspicious (8888877777) | Risk 54 — CAUTION |
| 🔴 Fraud Ring (7777766666) | Risk 96 — DANGER |
| 💸 OTP Scam (6666655555) | Risk 88 — DANGER |
| 🪪 Fake KYC (9123456789) | Risk 82 — DANGER |

---

## 🛡️ Backend API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/check-number` | POST | Analyze mobile + amount with Claude AI |
| `/api/stats` | GET | Dashboard statistics |
| `/api/predictions` | GET | Claude AI scam trend predictions |
| `/api/heatmap` | GET | 20 Indian city scam data |
| `/api/report` | POST | Report a fraudulent number |
| `/api/guardian/alert` | POST | Send guardian notification |

---

## 🌐 Android Emulator Note

If using Android emulator, the backend URL is automatically set to `http://10.0.2.2:8000` instead of `localhost:8000`. The app handles this automatically via `Platform.OS` check.

---

Made with ❤️ in India | FraudShield v1.0
