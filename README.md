<div align="center">

<img src="./assets/readme-logo.png" alt="AI Portfolio Maker" width="130" />

# AI Portfolio Maker

**Turn your resume into a stunning portfolio website in under a minute.**

Upload a PDF or DOCX, pick a template, let Google Gemini do the writing.

<br />

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

<br />

![Status](https://img.shields.io/badge/status-active-success?style=flat-square)
![License](https://img.shields.io/badge/license-Academic-blue?style=flat-square)
![Made With](https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F%20by%20Manoj-red?style=flat-square)
![Project](https://img.shields.io/badge/B.Tech-Major%20Project-orange?style=flat-square)

</div>

<br />

> Built as a B.Tech final year major project (Computer Science and Engineering, JNTUH, 2026).

---

## What it does

Most students skip building a portfolio because it takes too long. This project solves that. You upload your resume, the AI reads it, extracts your name, skills, projects, experience, and education, then fills a hand crafted HTML template with all of it. The result is a portfolio that looks designed, not generated.

You can then preview the output in the browser, edit the HTML directly, and download a standalone `.html` file you can host anywhere for free.

---

## Features

- Resume parsing for PDF and DOCX files
- Paste resume text as an alternative to file upload
- 10 professionally designed portfolio templates with distinct visual styles
- Live template preview before generating
- Google Gemini 1.5 Flash powers the content extraction and writing
- Built in HTML editor with live split screen preview
- Download your portfolio as a self contained HTML file
- Host on GitHub Pages in a few clicks (guided instructions included)
- Credit system: 5 credits per account, resets every 24 hours
- Portfolio history: view, edit, star, and delete past portfolios
- Dark and light mode support across all pages
- JWT authentication with secure password hashing

---

## Tech Stack

### Frontend

![React](https://img.shields.io/badge/React%2018-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat&logo=shadcnui&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-CA4245?style=flat&logo=reactrouter&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)

### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white)

### AI and Auth

![Google Gemini](https://img.shields.io/badge/Gemini%201.5%20Flash-4285F4?style=flat&logo=google&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcryptjs-525252?style=flat&logo=letsencrypt&logoColor=white)

### Parsing and Security

![pdf-parse](https://img.shields.io/badge/pdf--parse-EC1C24?style=flat&logo=adobeacrobatreader&logoColor=white)
![mammoth](https://img.shields.io/badge/mammoth-2B579A?style=flat&logo=microsoftword&logoColor=white)
![Helmet](https://img.shields.io/badge/Helmet.js-1F2937?style=flat&logo=shield&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=flat&logo=zod&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-FF6B6B?style=flat&logo=cloudflare&logoColor=white)

| Layer        | Technology                                          |
| ------------ | --------------------------------------------------- |
| Frontend     | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend      | Node.js, Express.js                                 |
| Database     | MongoDB Atlas (Mongoose ODM)                        |
| AI Engine    | Google Gemini 1.5 Flash API                         |
| Auth         | JWT, bcryptjs                                       |
| File Parsing | pdf-parse (PDF), mammoth (DOCX)                     |
| Security     | Helmet.js, CORS, express-rate-limit, Zod validation |

---

## Folder Structure

```
ai-portfolio-maker/
├── backend/
│   ├── config/db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js         # Register, login, getMe
│   │   └── portfolioController.js    # Generate and CRUD portfolios
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT verification
│   │   ├── errorHandler.js           # Global error handler
│   │   └── rateLimiter.js            # Request rate limiting
│   ├── models/
│   │   ├── User.js                   # User schema
│   │   └── Portfolio.js              # Portfolio schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── portfolioRoutes.js
│   ├── services/geminiService.js     # Gemini API integration
│   ├── utils/resumeParser.js         # PDF and DOCX text extraction
│   ├── validators/portfolioValidator.js
│   ├── app.js                        # Express app setup
│   └── server.js                     # Entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── AppLayout.tsx          # Authenticated page wrapper
        │   ├── AppSidebar.tsx         # Collapsible left nav
        │   └── ui/                    # shadcn/ui components
        ├── contexts/
        │   ├── AuthContext.tsx
        │   └── ThemeContext.tsx
        ├── lib/
        │   ├── api.ts                 # Axios instance and API helpers
        │   ├── templates.ts           # All 10 HTML templates
        │   └── utils.ts
        └── pages/
            ├── HomePage.tsx           # Landing page
            ├── AuthPage.tsx           # Login and register
            ├── DashboardPage.tsx      # Portfolio gallery
            ├── GeneratePage.tsx       # Resume upload and template picker
            ├── PreviewPage.tsx        # Full-screen portfolio view
            ├── EditorPage.tsx         # HTML editor with live preview
            ├── HistoryPage.tsx        # All portfolios with filters
            └── SettingsPage.tsx       # Account, theme, data export
```

---

## Setup

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- MongoDB Atlas account (free tier works)
- Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

---

### 1. Clone the repository

```bash
git clone https://github.com/manoj-mukkamula/ai-portfolio-maker.git
cd ai-portfolio-maker
```

---

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:

```bash
# Development (auto-restarts on changes)
npm run dev

# Production
npm start
```

The server runs on `http://localhost:5000`.

---

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:8080`. The Vite dev server automatically proxies all `/api` requests to the backend, so no additional configuration is needed.

---

## Usage

1. Open `http://localhost:8080` in your browser
2. Register a new account (you start with 5 free credits)
3. Go to **Generate**, upload your resume or paste the text
4. Select a template and click **Generate Portfolio**
5. The AI builds your portfolio in under a minute
6. Preview it, edit the HTML if needed, then download the `.html` file
7. Host on GitHub Pages or any static host for a free public URL

---

## API Reference

### Authentication

| Method | Endpoint             | Description      | Auth Required |
| ------ | -------------------- | ---------------- | ------------- |
| POST   | `/api/auth/register` | Create account   | No            |
| POST   | `/api/auth/login`    | Login            | No            |
| GET    | `/api/auth/me`       | Get current user | Yes           |
| DELETE | `/api/auth/account`  | Delete account   | Yes           |

### Portfolio

| Method | Endpoint                  | Description                | Auth Required |
| ------ | ------------------------- | -------------------------- | ------------- |
| POST   | `/api/portfolio/generate` | Generate portfolio with AI | Yes           |
| GET    | `/api/portfolio/history`  | List all user portfolios   | Yes           |
| GET    | `/api/portfolio/:id`      | Get portfolio HTML         | Yes           |
| PUT    | `/api/portfolio/:id`      | Update portfolio HTML      | Yes           |
| DELETE | `/api/portfolio/:id`      | Delete portfolio           | Yes           |

---

## Security

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days
- Helmet.js sets HTTP security headers
- CORS restricts access to configured origins
- Rate limiting on all API routes
- Zod schema validation on all request bodies
- File upload restricted to PDF and DOCX only
- Portfolio ownership enforced on all routes
- Secrets stored in environment variables, never in code

---

## Deployment

The backend can be deployed to any Node.js host (Render, Railway, Fly.io, etc.). The frontend builds to a static bundle with `npm run build` and can be deployed to Vercel, Netlify, or served by the backend itself.

[![Render](https://img.shields.io/badge/Render-46E3B7?style=flat&logo=render&logoColor=white)](https://render.com/)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat&logo=railway&logoColor=white)](https://railway.app/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat&logo=netlify&logoColor=white)](https://netlify.com/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-181717?style=flat&logo=github&logoColor=white)](https://pages.github.com/)

For the free Gemini API tier, the daily quota resets at midnight Pacific Time (around 12:30 PM IST). You can add a second key as `GEMINI_API_KEY_2` in your `.env` to extend availability.

---

## Author

**Mukkamula Manoj**
Final Year B.Tech, Computer Science and Engineering
AAR Mahaveer Engineering College (JNTUH, 2026)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/feed/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/manoj-mukkamula/ai-portfolio-maker)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:mukkamulamanoj@gmail.com)

---

## License

This project was built as an academic submission for B.Tech Major Project requirements.
Free to use for educational and demonstration purposes.

<div align="center">

<sub>If this project helped you, consider giving it a star on GitHub.</sub>

</div>
