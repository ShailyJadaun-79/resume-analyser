# ResumeAI - Enterprise AI Resume Builder & ATS Checker

ResumeAI is a production-grade, premium AI-powered Resume Builder and ATS Optimization platform that lets users create, customize, and analyze unlimited professional ATS-friendly resumes for free.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, React Router, React Hook Form, React Icons, Axios.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB Atlas.
- **Auth**: JWT, bcrypt, Google OAuth 2.0.
- **Storage**: Cloudinary (for profile photos and potential template assets).
- **AI**: OpenAI API / Gemini API (via custom flexible LLM wrapper).
- **Deployment**: Vercel (Frontend), Render (Backend).

## Project Structure
```
Resume-analyser/
├── package.json              # Monorepo root configuration
├── README.md                 # Project guide
├── .gitignore                # Root gitignore
├── client/                   # Vite + React Frontend
└── server/                   # Express Backend
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB Atlas database connection string

### Setup & Installation
1. Clone the repository.
2. Install dependencies for root, client, and server:
   ```bash
   npm run install-all
   ```
3. Create `.env` files in both the `client/` and `server/` directories based on the `.env.example` templates.
4. Start the development server for both frontend and backend concurrently:
   ```bash
   npm run dev
   ```

### Scripts
- `npm run install-all`: Installs all dependencies across the monorepo.
- `npm run dev`: Runs client and server concurrently in development mode.
- `npm run dev:client`: Runs only the Vite React frontend.
- `npm run dev:server`: Runs only the Express backend.
- `npm run build:client`: Builds the frontend for production.
- `npm start:server`: Starts the Express backend in production mode.
