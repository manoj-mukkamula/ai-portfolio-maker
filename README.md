# AI Portfolio Maker

> Turn your resume into a portfolio website in under a minute.

Upload a PDF or DOCX, pick from 10 hand-crafted templates, and let Google Gemini handle the rest. The output is a clean, standalone `.html` file you can host anywhere for free.

Built as a B.Tech final year major project — Computer Science and Engineering, JNTUH, 2026.

![GitHub repo size](https://img.shields.io/github/repo-size/manoj-mukkamula/ai-portfolio-maker?style=flat-square&color=0d1117&labelColor=1a1a2e)
![Last commit](https://img.shields.io/github/last-commit/manoj-mukkamula/ai-portfolio-maker?style=flat-square&color=0d1117&labelColor=1a1a2e)
![License](https://img.shields.io/badge/license-Academic-blue?style=flat-square&color=0d1117&labelColor=1a1a2e)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square&color=0d1117&labelColor=1a1a2e)

---

## What it does

Most students skip building a portfolio because it takes too long. You upload your resume, Gemini reads it, extracts your name, skills, projects, experience, and education, then populates a hand-crafted HTML template with everything. The result looks designed, not auto-generated.

From there you get a live preview, a built-in HTML editor with split-screen output, and a one-click download. Host the file on GitHub Pages and you have a public URL — no server, no subscription.

---

## Features

- Resume upload (PDF and DOCX) or plain text paste
- 10 professionally designed portfolio templates with distinct visual styles
- Live template preview before generating
- Google Gemini 1.5 Flash for content extraction and writing
- Built-in HTML editor with live split-screen preview
- Download as a self-contained `.html` file — no dependencies, host anywhere
- GitHub Pages hosting guide built into the app
- Credit system: 5 credits per account, resets every 24 hours
- Portfolio history with view, edit, star, and delete
- Dark and light mode across all pages
- JWT authentication with bcrypt password hashing

---

## Templates

| Name | Style |
|---|---|
| Vanta Pro | Premium · Adaptive dark/light |
| Aurora Luxury | Premium · Dark · Modern |
| Swiss Precision | Premium · Light · Minimal |
| Kinetic Magazine | Premium · Light · Modern |
| Glass Terminal | Dark · Minimal |
| Obsidian Code | Dark · Minimal |
| Aurora Studio | Dark · Modern |
| Deep Dark Minimal | Dark · Minimal |
| Clean Light Unique | Light · Minimal |
| Brutalist Grid | Light · Modern |

---

## Tech Stack

**Frontend**

![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)

**Backend**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat-square&logo=mongoose&logoColor=white)

**AI & Auth**

![Gemini](https://img.shields.io/badge/Gemini_1.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcryptjs-525252?style=flat-square&logo=letsencrypt&logoColor=white)

**Parsing & Security**

![pdf-parse](https://img.shields.io/badge/pdf--parse-EC1C24?style=flat-square&logo=adobeacrobatreader&logoColor=white)
![mammoth](https://img.shields.io/badge/mammoth-2B579A?style=flat-square&logo=microsoftword&logoColor=white)
![Helmet](https://img.shields.io/badge/Helmet.js-1F2937?style=flat-square&logo=nodedotjs&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white)

---

## Folder Structure

```
ai-portfolio-maker/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── portfolioController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   └── Portfolio.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── portfolioRoutes.js
│   ├── services/geminiService.js
│   ├── utils/resumeParser.js
│   ├── validators/portfolioValidator.js
│   ├── app.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── AppLayout.tsx
        │   ├── AppSidebar.tsx
        │   └── ui/
        ├── contexts/
        │   ├── AuthContext.tsx
        │   └── ThemeContext.tsx
        ├── lib/
        │   ├── api.ts
        │   ├── templates.ts
        │   └── utils.ts
        └── pages/
            ├── HomePage.tsx
            ├── AuthPage.tsx
            ├── DashboardPage.tsx
            ├── GeneratePage.tsx
            ├── PreviewPage.tsx
            ├── EditorPage.tsx
            ├── HistoryPage.tsx
            └── SettingsPage.tsx
```

---

## Setup

**Prerequisites:** Node.js v18+, npm v9+, MongoDB Atlas account (free tier), Google Gemini API key

### 1. Clone

```bash
git clone https://github.com/manoj-mukkamula/ai-portfolio-maker.git
cd ai-portfolio-maker
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev   # development
npm start     # production
```

Server runs on `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:8080`. The Vite dev server proxies all `/api` requests to the backend automatically.

---

## Usage

1. Open `http://localhost:8080`
2. Register — you start with 5 free credits
3. Go to **Generate**, upload your resume or paste the text
4. Pick a template and click **Generate Portfolio**
5. Preview it, edit the HTML if you want, download the `.html` file
6. Host on GitHub Pages for a free public URL

---

## API Reference

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create account | No |
| `POST` | `/api/auth/login` | Login | No |
| `GET` | `/api/auth/me` | Get current user | Yes |
| `DELETE` | `/api/auth/account` | Delete account | Yes |

### Portfolio

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/portfolio/generate` | Generate portfolio | Yes |
| `GET` | `/api/portfolio/history` | List all portfolios | Yes |
| `GET` | `/api/portfolio/:id` | Get portfolio HTML | Yes |
| `PUT` | `/api/portfolio/:id` | Update portfolio HTML | Yes |
| `DELETE` | `/api/portfolio/:id` | Delete portfolio | Yes |

---

## Security

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days
- Helmet.js sets HTTP security headers
- CORS restricts access to configured origins
- Rate limiting on all API routes
- Zod schema validation on all request bodies
- File uploads restricted to PDF and DOCX
- Portfolio ownership enforced on every route
- All secrets in environment variables, never in code

---

## Deployment

The backend deploys to any Node.js host — Render, Railway, Fly.io. The frontend builds to a static bundle with `npm run build` and deploys to Vercel or Netlify, or can be served directly by the backend.

![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-181717?style=flat-square&logo=github&logoColor=white)

**Gemini API note:** The free tier daily quota resets at midnight Pacific Time (around 12:30 PM IST). You can add a second key as `GEMINI_API_KEY_2` in `.env` to extend availability.

---

## Author

**Mukkamula Manoj**
Final Year B.Tech, Computer Science and Engineering
AAR Mahaveer Engineering College, JNTUH — 2026

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/feed/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/manoj-mukkamula/ai-portfolio-maker)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:mukkamulamanoj@gmail.com)

---

*Built as an academic submission for B.Tech Major Project requirements. Free to use for educational and demonstration purposes.*
