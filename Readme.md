# InterviewIQ 🧠
An **AI-powered mock interview platform** to practice role-specific interviews, get detailed feedback, and track your improvement over time. Built with **MERN Stack** and **Google Gemini AI**.

🔗 Live Demo — https://interview-iq-wheat.vercel.app

---

## 🚀 Features
- **AI-Powered Question Generation** — Uses **Gemini AI** to generate dynamic, role-specific interview questions
- **Voice Input** — Answer questions using your microphone via Web Speech API
- **Interactive Code Editor** — Built-in Monaco editor with live code execution
- **Screen Recording** — Record your session locally to review performance
- **AI Feedback** — Per-question review with overall rating out of 10
- **Progress Tracking** — Chart to visualize your improvement over time
- **Interview Templates** — Quick setup for popular roles and stacks
- **Retake Interviews** — Redo any past interview in one click

---

## 🛠️ Tech Stack

### Frontend
- **React.js + Vite** — Fast and optimized UI
- **TypeScript** — Type-safe codebase
- **Tailwind CSS** — Modern responsive styling
- **Shadcn UI** — Reusable component library
- **Lucide React** — Icon library

### Backend
- **Node.js + Express.js** — REST API backend
- **TypeScript** — Type-safe server code
- **MongoDB Atlas** — Cloud database
- **Firebase Authentication** — Secure user auth
- **Google Gemini AI** — Question generation and feedback

---

## 📂 Folder Structure
📦 InterviewIQ
├── 📁 client   # Frontend (React + Vite)
├── 📁 server   # Backend (Node.js + Express)
└── README.md
---

## 🔧 Setup Instructions

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/anjali-sharma-27/InterviewIQ.git
cd InterviewIQ
```

### 2️⃣ Setup Frontend
```sh
cd client
npm install
cp .env.sample .env
# Fill in your values in .env
npm run dev
```

### 3️⃣ Setup Backend
```sh
cd server
npm install
cp .env.sample .env
# Fill in your values in .env
npm run dev
```

---

## 🔑 Environment Variables

### client/.env
VITE_SERVER_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=

### server/.env
MONGODB_URI=
GEMINI_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
PORT=8000

---

## 🚀 Deployment
- **Frontend** — Deployed on **Vercel**
- **Backend** — Deployed on **Render**

---

## 👩‍💻 Author
**Anjali Sharma**
- GitHub — https://github.com/anjali-sharma-27
- LinkedIn —https://www.linkedin.com/in/anjali-sharma-27
