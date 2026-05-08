# SafeSpace AI

An AI-powered public space safety evaluation platform that helps users report perceived safety in urban spaces and helps planners identify unsafe design elements.

## Features

- **Safety Map** — Real-time Leaflet/OpenStreetMap map with color-coded markers (green/yellow/red)
- **Report Form** — Multi-step form with sliders, time-of-day picker, issue tags, and live score preview
- **AI Recommendations** — Contextual recommendations generated from low scores and selected issue tags
- **Planner Dashboard** — Aggregate stats, risk distribution, most common issues, and high-risk location table
- **Safe Route Helper** — Coordinate-based route analysis with nearby unsafe areas highlighted
- **Firebase Auth** — Email/password signup and login
- **Firestore** — Real-time report storage with automatic seed data on first run

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a Firebase project at https://console.firebase.google.com, then:

- Enable **Email/Password** authentication (Authentication → Sign-in method)
- Create a **Firestore** database (start in test mode for development)
- Register a web app and copy your config

Open `src/firebase.ts` and replace the placeholder values:

```ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:5173

### 4. Deploy to Firebase Hosting

Install the Firebase CLI if you haven't already:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

When prompted:
- Select your Firebase project
- Set public directory to `dist`
- Configure as a single-page app: Yes
- Do not overwrite `dist/index.html`

Then build and deploy:

```bash
npm run build
firebase deploy
```

## Firestore Rules (Production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Firebase (Auth + Firestore)
- Leaflet.js + OpenStreetMap
- CSS custom properties (no external UI library)
