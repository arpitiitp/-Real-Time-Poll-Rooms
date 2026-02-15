# Real-Time Polling App

A fast, interactive polling application built with the **MERN Stack** and **Socket.io**.  
Users can create polls, share links, and watch votes roll in live—no page refreshes needed.

---

## Tech Stack

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

## Quick Start

### 1. Backend
```bash
cd backend
npm install
# Create a .env file with MONGODB_URI=your_connection_string
npm run dev
# Server starts on port 5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# App opens at http://localhost:5173
```

---

## How it Works (Security & Fairness)

I implemented a two-tier system to keep polls fair without forcing users to create accounts.

1.  **UX Layer (LocalStorage)**
    The frontend remembers which polls you've mistakenly voted on and disables the buttons. It's just for a better user experience so you don't accidentally try to vote twice.

2.  **Security Layer (IP Tracking)**
    The real check happens on the backend. We log the IP address of every voter in the database. Even if someone wipes their browser storage or uses a different browser, the API will reject the vote if the IP matches.

### Edge Cases I Handled
*   **Race Conditions**: Used MongoDB's `$inc` operator. If 100 people vote at the exact same millisecond, the database handles the math correctly. No "read-modify-write" bugs.
*   **Real-time Synch**: Used Socket.io rooms. You only get updates for the poll you're actually looking at, not every poll on the server.
*   **Mobile/Desktop**: Fully responsive UI with Tailwind.

### Known Limitations
*   **Shared Wifi**: Since I'm tracking public IPs, people in the same office/dorm might be blocked after the first person votes. (Fix: add browser fingerprinting).
*   **VPNs**: A determined troll could use a VPN to vote multiple times. (Fix: add ReCAPTCHA).

---

## Screenshots
*(Add your screenshots here)*
