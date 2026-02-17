# Deployment Guide

This guide explains how to deploy the **Real-Time Polling App** for free.

## Architecture
- **Backend**: **Render** (Free Web Service)
    -   *Why?* Render's free tier supports persistent Node.js servers, which is **required** for Socket.io (WebSockets). Vercel Serverless functions do NOT support this.
- **Frontend**: **Vercel** (Free Tier)
    -   *Why?* Excellent for static React/Vite apps and provides a global CDN.

---

## Part 1: Deploy Backend (Render)

1.  **Push Code to GitHub**: Make sure your project is on GitHub.
2.  **Sign Up**: Go to [render.com](https://render.com) and sign in with GitHub.
3.  **Create Service**:
    -   Click **New +** -> **Web Service**.
    -   Connect your GitHub repository.
4.  **Configure Settings**:
    -   **Name**: `polling-backend` (or similar)
    -   **Root Directory**: `backend` (Important!)
    -   **Runtime**: Node
    -   **Build Command**: `npm install`
    -   **Start Command**: `node index.js`
    -   **Instance Type**: Free
5.  **Environment Variables**:
    -   Scroll down to **Environment Variables**.
    -   Add `MONGODB_URI`: *[Your MongoDB Connection String]*
    -   Add `PORT`: `5000` (Optional, Render sets this automatically usually, but safe to add).
6.  **Deploy**: Click **Create Web Service**.
7.  **Copy URL**: Once deployed, copy `https://your-app.onrender.com`.

> **Note**: The free tier on Render spins down after inactivity. The first request might take 30-50 seconds. This is normal for the free plan.

---

## Part 2: Deploy Frontend (Vercel)

1.  **Sign Up**: Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2.  **Add New Project**:
    -   Click **Add New...** -> **Project**.
    -   Import the same GitHub repository.
3.  **Configure Settings**:
    -   **Framework Preset**: Vite (should be auto-detected).
    -   **Root Directory**: Click "Edit" and select `frontend`.
4.  **Environment Variables**:
    -   Expand **Environment Variables**.
    -   Add `VITE_API_URL`: `https://your-app.onrender.com/api/polls`
    -   Add `VITE_SOCKET_URL`: `https://your-app.onrender.com`
    -   *(Replace with your actual Render URL from Part 1)*.
5.  **Deploy**: Click **Deploy**.

---

## Troubleshooting

-   **Socket Connection Failed**: Ensure `VITE_SOCKET_URL` effectively points to the Render root URL (no `/api/polls` suffix).
-   **CORS Errors**: The backend is configured to allow all origins (`cors({ origin: '*' })`) so this should not happen.
-   **404 on Refresh**: Ensure the `frontend/vercel.json` file handles rewrites (already included in codebase).
