# AI Portfolio Maker

A full-stack web application that turns your resume into a professional portfolio website using Google Gemini AI. Upload a PDF or DOCX, choose a template, and get a fully built portfolio in under a minute.

Built as a B.Tech final year major project (Computer Science and Engineering, JNTUH, 2026).

---

## What it does

Most students skip building a portfolio because it takes too long. This project solves that. You upload your resume, the AI reads it, extracts your name, skills, projects, experience, and education, then fills a hand-crafted HTML template with all of it. The result is a portfolio that looks designed, not generated.

You can then preview the output in the browser, edit the HTML directly, and download a standalone `.html` file you can host anywhere for free.

---

## Features

- Resume parsing for PDF and DOCX files
- Paste resume text as an alternative to file upload
- 10 professionally designed portfolio templates with distinct visual styles
- Live template preview before generating
- Google Gemini 1.5 Flash powers the content extraction and writing
- Built-in HTML editor with live split-screen preview
- Download your portfolio as a self-contained HTML file
- Host on GitHub Pages in a few clicks (guided instructions included)
- Credit system: 5 credits per account, resets every 24 hours
- Portfolio history: view, edit, star, and delete past portfolios
- Dark and light mode support across all pages
- JWT authentication with secure password hashing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| AI Engine | Google Gemini 1.5 Flash API |
| Auth | JWT, bcryptjs |
| File Parsing | pdf-parse (PDF), mammoth (DOCX) |
| Security | Helmet.js, CORS, express-rate-limit, Zod validation |

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
git clone https://github.com/your-username/ai-portfolio-maker.git
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

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| DELETE | `/api/auth/account` | Delete account | Yes |

### Portfolio

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/portfolio/generate` | Generate portfolio with AI | Yes |
| GET | `/api/portfolio/history` | List all user portfolios | Yes |
| GET | `/api/portfolio/:id` | Get portfolio HTML | Yes |
| PUT | `/api/portfolio/:id` | Update portfolio HTML | Yes |
| DELETE | `/api/portfolio/:id` | Delete portfolio | Yes |

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

For the free Gemini API tier, the daily quota resets at midnight Pacific Time (around 12:30 PM IST). You can add a second key as `GEMINI_API_KEY_2` in your `.env` to extend availability.

---

## Author

**Mukkamula Manoj**
B.Tech, Computer Science and Engineering
JNTUH Affiliated College, Hyderabad, 2026

---

## License

This project was built as an academic submission for B.Tech Major Project requirements.
Free to use for educational and demonstration purposes.
