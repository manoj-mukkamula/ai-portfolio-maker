# AI Portfolio Maker

> **B.Tech Major Project — Computer Science & Engineering**
> AI-powered web application that converts a resume (PDF/DOCX) into a fully-designed, downloadable portfolio website using Google Gemini AI.

---

## 📌 Project Overview

**AI Portfolio Maker** is a full-stack web application that automates the creation of professional portfolio websites. Users upload their resume, choose a visual template, and the system uses the **Google Gemini 1.5 Flash** large language model to intelligently extract structured data from the resume and populate the selected HTML template — producing a unique, styled portfolio page in seconds.

The project demonstrates the practical application of Generative AI (LLM API integration), document processing (PDF/DOCX parsing), RESTful API design, and modern frontend development within a secure, user-authenticated web system.

---

## ✨ Features

### AI Features (Core)
- **Resume → Portfolio Generation** — Gemini 1.5 Flash reads resume text (from PDF/DOCX upload or pasted text) and fills HTML template placeholders with accurate, context-aware content
- **Intelligent Data Extraction** — AI infers skills, projects, experience, education, and contact details without rigid form filling
- **Tone Adaptation** — The AI adjusts language and presentation style based on the selected portfolio template

### Application Features
- **6 Professional HTML Templates** — Glass Terminal, Brutalist Grid, Aurora Luxury, Swiss Precision, Obsidian Code, Kinetic Magazine
- **Live Template Preview** — Real-time iframe preview before generation
- **HTML Editor** — After generation, users can manually edit the raw HTML with a live split-screen preview
- **Portfolio Download** — Generated portfolios download as standalone `.html` files (no server dependency)
- **Portfolio History** — All generated portfolios are stored per-user with view, edit, and delete controls
- **Credit System** — Each generation costs 1 credit; credits tracked per user in MongoDB
- **JWT Authentication** — Secure login/register with bcrypt password hashing and JWT token auth
- **File Upload** — Multer-based PDF and DOCX file upload with server-side parsing

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **AI / LLM** | Google Gemini 1.5 Flash API (`@google/generative-ai`) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **File Parsing** | pdf-parse (PDF), mammoth (DOCX) |
| **Security** | Helmet.js, CORS, express-rate-limit, Zod validation |
| **Dev Tools** | Nodemon, ESLint, Vitest |

---

## 📁 Folder Structure

```
ai-portfolio-maker/
│
├── backend/                        # Node.js + Express API server
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Register, login, getMe
│   │   └── portfolioController.js  # Generate, CRUD portfolios
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   ├── errorHandler.js         # Global error handler
│   │   └── rateLimiter.js          # express-rate-limit config
│   ├── models/
│   │   ├── User.js                 # User schema (name, email, password hash, credits)
│   │   └── Portfolio.js            # Portfolio schema (userId, html, templateName)
│   ├── routes/
│   │   ├── authRoutes.js           # POST /api/auth/register, /login, GET /me
│   │   └── portfolioRoutes.js      # POST /generate, GET /history, GET /:id, PUT /:id, DELETE /:id
│   ├── services/
│   │   └── geminiService.js        # Gemini API integration — core AI logic
│   ├── utils/
│   │   └── resumeParser.js         # PDF and DOCX text extraction
│   ├── validators/
│   │   └── portfolioValidator.js   # Zod schema validators
│   ├── .env.example                # Environment variable template
│   ├── app.js                      # Express app setup (middleware, routes)
│   ├── server.js                   # Entry point — connects DB and starts server
│   └── package.json
│
└── frontend/                       # React + TypeScript SPA
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── AppLayout.tsx        # Authenticated page wrapper (header + sidebar)
    │   │   ├── AppSidebar.tsx       # Left nav sidebar
    │   │   └── ui/                  # shadcn/ui component library
    │   ├── contexts/
    │   │   └── AuthContext.tsx      # React auth context (login, logout, user state)
    │   ├── hooks/
    │   │   └── use-toast.ts         # Toast notification hook
    │   ├── lib/
    │   │   ├── api.ts               # Axios instance + auth/portfolio API helpers
    │   │   ├── templates.ts         # All 6 HTML templates with embedded CSS
    │   │   └── utils.ts             # Tailwind class merge utility
    │   ├── pages/
    │   │   ├── LoginPage.tsx        # /login
    │   │   ├── RegisterPage.tsx     # /register
    │   │   ├── DashboardPage.tsx    # /dashboard — portfolio gallery
    │   │   ├── GeneratePage.tsx     # /generate — resume upload + template select
    │   │   ├── PreviewPage.tsx      # /preview/:id — full-screen portfolio view
    │   │   ├── EditorPage.tsx       # /editor/:id — HTML editor with live preview
    │   │   ├── HistoryPage.tsx      # /history — all portfolios list
    │   │   └── NotFound.tsx         # 404
    │   ├── App.tsx                  # Router setup + protected routes
    │   └── main.tsx                 # React entry point
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.ts
    └── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (free tier works)
- Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

---

### 1. Clone / Extract the project

```bash
# If using git:
git clone <your-repo-url>
cd ai-portfolio-maker

# Or extract the submitted zip and navigate into it
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

Backend runs on **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the dev server:

```bash
npm run dev
```

Frontend runs on **http://localhost:8080**

The Vite dev server is configured to proxy `/api` requests to `http://localhost:5000` automatically, so no additional CORS configuration is needed during development.

---

### 4. Using the Application

1. Open **http://localhost:8080** in your browser
2. Click **Sign up** and create an account (starts with 5 credits)
3. Go to **Generate** → upload your resume PDF or paste resume text
4. Select a template and click **Generate Portfolio**
5. The AI fills the template with your data — view in **Preview**
6. Edit the HTML if needed in the **Editor**, then **Download** the final `.html` file

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new user account | ❌ |
| POST | `/api/auth/login` | Login and receive JWT token | ❌ |
| GET | `/api/auth/me` | Get authenticated user details | ✅ JWT |

**Register request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Login response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "John Doe", "credits": 5 }
}
```

---

### Portfolio

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/portfolio/generate` | Generate portfolio using AI | ✅ JWT |
| GET | `/api/portfolio/history` | List all user portfolios | ✅ JWT |
| GET | `/api/portfolio/:id` | Get single portfolio with full HTML | ✅ JWT |
| PUT | `/api/portfolio/:id` | Update portfolio HTML (after manual edit) | ✅ JWT |
| DELETE | `/api/portfolio/:id` | Delete a portfolio | ✅ JWT |

**Generate request** (`multipart/form-data` for file upload):
```
resume: <PDF or DOCX file>
template: <full HTML string with {{placeholders}}>
templateName: glass-terminal
```

**Generate request** (JSON for pasted text):
```json
{
  "resumeText": "John Doe\nSoftware Engineer\n...",
  "template": "<!DOCTYPE html>...",
  "templateName": "swiss-precision"
}
```

**Generate response:**
```json
{
  "success": true,
  "creditsRemaining": 4,
  "portfolio": {
    "id": "66f...",
    "templateName": "glass-terminal",
    "createdAt": "2025-04-01T10:00:00.000Z",
    "finalHTML": "<!DOCTYPE html>..."
  }
}
```

---

## 🔒 Security Practices

- **Passwords** are hashed with `bcryptjs` (salt rounds: 10) — never stored in plain text
- **JWT tokens** are signed with a secret key and expire after 7 days
- **Helmet.js** sets HTTP security headers (X-Frame-Options, CSP, HSTS, etc.)
- **CORS** restricts API access to configured frontend origins only
- **Rate limiting** via `express-rate-limit` prevents brute-force and API abuse
- **Zod schema validation** on all API request bodies — rejects malformed input
- **File upload validation** — only PDF and DOCX MIME types accepted; file size limited
- **Portfolio ownership** enforced — users can only access/modify their own portfolios
- **Environment variables** store all secrets — `.env` is gitignored

---

## 🚀 Future Improvements

1. **Publish as live URL** — Host the generated portfolio on a subdomain (e.g., `username.aiportfolio.com`) instead of download-only
2. **Custom domain support** — Allow users to point their own domain to a hosted portfolio
3. **More templates** — Add mobile-focused, creative, and academic portfolio styles
4. **Resume parsing improvements** — Use OCR for scanned PDF resumes
5. **Real-time editing with AI assist** — Inline AI suggestions while editing HTML
6. **Email-based password reset** — Forgot password flow using Nodemailer
7. **OAuth login** — Sign in with Google / GitHub
8. **Portfolio analytics** — Track views if portfolio is hosted publicly
9. **PDF export** — Export portfolio as a PDF in addition to HTML
10. **Subscription / payment integration** — Razor Pay or Stripe for credit top-up

---

## 👨‍💻 Author

**Mukkamula Manoj**
B.Tech — Computer Science & Engineering
JNTUH Affiliated College

---

## 📄 License

This project was developed as an academic submission for B.Tech Major Project requirements.
For educational and demonstration purposes only.
