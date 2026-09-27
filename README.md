# Job Portal — AI-Powered MERN Platform

An enterprise-ready, full-stack job portal built with the **MERN stack** (MongoDB, Express.js, React 18, Node.js) and powered by **Google Gemini AI**. The platform features dual AI assistants — a **Student Career Coach** for job seekers and a **RAG Recruiter Assistant** for hiring teams — along with an intelligent **Applicant Tracking System (ATS)**, automated **resume PDF skill extraction**, candidate **match scoring & ranking**, **AI interview generation**, and **comprehensive hiring scorecards**.

---

## ✨ Key Features

### 🎓 For Job Seekers (Students)
- **AI Career Assistant Drawer** — An interactive AI career mentor accessible directly from the navigation bar. Provides real-time guidance on job matching, skill gap closure, resume enhancement recommendations, and interview preparation with persistent chat history.
- **Email OTP Verification** — Secure account registration with email verification (via Nodemailer + Gmail OAuth2) and instant auto-login upon confirmation.
- **Smart Job Search & Filters** — Browse, search, and filter job postings by keywords, location, and industry domain.
- **Automated Resume Parsing** — Upload PDF resumes; the system extracts, normalizes, and deduplicates technical skills and automatically syncs them to your user profile.
- **AI Resume Match Score** — View instant compatibility scores (%) comparing your resume skills against specific job requirements with matched vs. missing skills breakdown.
- **Application Tracking** — Track application statuses in real-time (`Applied`, `Accepted`, `Rejected`).
- **Profile & Security** — Manage bio, contact details, skills, resume files, and reset/change passwords via secure OTP verification.

### 💼 For Recruiters
- **Company & Job Management** — Create and configure companies, publish job openings with structured requirement tags, and edit active listings.
- **Smart ATS (Applicant Tracking System)**:
  - **AI Match Ranking** — Instantly sort candidates by AI Match Score (highest to lowest) or application date.
  - **Dynamic Match Level Filters** — Segment applicants into High Match (≥ 70%), Medium Match (40–69%), and Low Match (< 40%).
  - **Talent Overview Bar** — High-level summary of top applicant score, average talent score, and applicant count.
  - **Applicant Decisioning** — Accept or reject candidates with real-time status badges.
- **RAG Recruiter Assistant** — Ask free-form questions about applicants (e.g., *"Compare candidate A and B"*, *"What are their missing backend skills?"*, *"Who has the strongest React experience?"*). Grounded in actual resume data.
- **AI Interview Generator & Evaluator** — Automatically generate 5 role-tailored technical and behavioral interview questions with scoring guidelines.
- **AI Hiring Report Scorecard** — Generate multidimensional candidate evaluations (Technical, Problem Solving, Domain Fit, Culture Fit) with identified strengths, critical skill gaps, and hiring tier recommendations (`Strong Hire`, `Hire`, `Hire with Training`, `Hold`, `Reject`).

### 🧠 Dual-Mode AI Architecture
- **Built-in Standalone Engine (Zero Setup)** — Comes with a complete, rule-grounded NLP and RAG fallback engine (`aiFallbackService.js`) that works immediately without any external API keys or paid credits.
- **Google Gemini 1.5 Flash Support** — Seamlessly elevates responses using Gemini LLM when `GEMINI_API_KEY` is provided in `.env`.
- **Optional Python FastAPI Microservice** — Dedicated microservice (`ai-service`) using `SentenceTransformers` embeddings, cosine similarity, and NLTK text processing.

---

## 🛠 Tech Stack

### Frontend
| Technology | Description |
|:---|:---|
| **React 18 + Vite** | High-performance SPA frontend and build tooling |
| **Redux Toolkit + Redux Persist** | Global state management with local storage persistence |
| **React Router DOM v7** | Client-side routing and protected routes |
| **Tailwind CSS** | Responsive styling and modern UI components |
| **Radix UI / shadcn/ui** | Accessible UI primitives (Dialog, Select, Popover, Badge, Drawer) |
| **Framer Motion** | Fluid animations and transitions |
| **Axios** | HTTP client with cookie-based credential handling |
| **Lucide React** | Modern iconography |
| **Sonner** | Interactive toast notifications |

### Backend
| Technology | Description |
|:---|:---|
| **Node.js + Express.js** | RESTful API server |
| **MongoDB + Mongoose** | Document database with relational population |
| **JWT + bcryptjs** | Authentication and password hashing via httpOnly cookies |
| **Multer + Cloudinary** | Secure media and PDF resume uploads |
| **pdf-parse** | Server-side PDF extraction for resume skill parsing |
| **Nodemailer + Gmail OAuth2** | OTP transactional email verification and password reset |
| **Google Gemini API** | Advanced LLM synthesis for career coaching, RAG Q&A, and reports |

### Optional AI Microservice (`ai-service`)
| Technology | Description |
|:---|:---|
| **Python 3.10+ / FastAPI** | High-throughput asynchronous AI microservice |
| **SentenceTransformers** | Semantic vector embeddings (`all-MiniLM-L6-v2`) |
| **pdfplumber / NLTK** | Deep resume text processing and tokenization |

---

## 📁 Project Structure

```
job-portal/
├── Backend/
│   ├── controllers/
│   │   ├── user.controller.js           # Auth, OTP verification, profile management
│   │   ├── job.controller.js            # Job posting, public search, recommendations
│   │   ├── company.controller.js        # Company registration and updates
│   │   ├── application.controller.js    # Job application submission and ATS status
│   │   └── ai.controller.js             # Dual AI assistants, match scores, interviews, reports
│   ├── models/
│   │   ├── user.model.js                # User schema (Student & Recruiter roles)
│   │   ├── job.model.js                 # Job schema with requirements & company ref
│   │   ├── company.model.js             # Company profile & branding schema
│   │   ├── application.model.js         # Application status & applicant references
│   │   ├── resumeAnalysis.model.js      # Extracted resume skills & raw parsed text
│   │   ├── candidateMatch.model.js      # Match percentage, matched & missing skills
│   │   ├── ragConversation.model.js     # Recruiter AI assistant conversation history
│   │   ├── studentConversation.model.js # Student Career Assistant conversation history
│   │   ├── interview.model.js           # AI interview questions & evaluation rubrics
│   │   └── aiReport.model.js            # Comprehensive candidate hiring scorecards
│   ├── routes/
│   │   ├── user.route.js                # /api/user/*
│   │   ├── job.route.js                 # /api/job/*
│   │   ├── company.route.js             # /api/company/*
│   │   ├── application.route.js         # /api/application/*
│   │   └── ai.route.js                  # /api/ai/*
│   ├── middleware/
│   │   ├── isAuthenticated.js           # JWT authentication check
│   │   ├── optionalAuth.js              # Optional token resolver for public routes
│   │   └── multer.js                    # Memory storage file upload handler
│   ├── utils/
│   │   ├── db.js                        # MongoDB database connection
│   │   ├── cloud.js                     # Cloudinary configuration
│   │   ├── datauri.js                   # Buffer to Data URI transformer
│   │   ├── mailer.js                    # Nodemailer Gmail OAuth2 transporter
│   │   ├── resumeExtractor.js           # PDF parsing and skill taxonomy normalizer
│   │   ├── aiFallbackService.js         # Standalone grounded AI engine (no API key needed)
│   │   └── aiClient.js                  # Microservice bridge client
│   ├── example.env                      # Environment variable blueprint
│   └── index.js                         # Server entry point
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admincomponent/
│   │   │   │   ├── Applicants.jsx             # ATS dashboard with AI ranking & filters
│   │   │   │   ├── ApplicantsTable.jsx        # Candidate table with match breakdown
│   │   │   │   ├── AIAssistantDrawer.jsx      # Recruiter RAG assistant chat drawer
│   │   │   │   ├── AIInterviewModal.jsx       # Candidate interview generator modal
│   │   │   │   ├── AIReportModal.jsx          # Candidate hiring scorecard modal
│   │   │   │   ├── FormattedMessage.jsx       # Markdown styling for AI chat responses
│   │   │   │   ├── AdminJobs.jsx              # Recruiter job management view
│   │   │   │   ├── AdminJobsTable.jsx         # Recruiter job list table
│   │   │   │   ├── Companies.jsx              # Recruiter companies view
│   │   │   │   ├── CompaniesTable.jsx         # Recruiter company list table
│   │   │   │   ├── CompanyCreate.jsx          # Register company form
│   │   │   │   ├── CompanySetup.jsx           # Company settings and logo upload
│   │   │   │   ├── PostJob.jsx                # Job publication form
│   │   │   │   └── ProtectedRoute.jsx         # Role-based route guard
│   │   │   ├── components_lite/
│   │   │   │   ├── Navbar.jsx                 # Navigation with Student AI trigger
│   │   │   │   ├── StudentAIAssistantDrawer.jsx # Student AI Career Coach drawer
│   │   │   │   ├── Profile.jsx                # Student profile with resume upload & skills
│   │   │   │   ├── ResumeAnalysis.jsx         # Skill match analyzer modal
│   │   │   │   ├── JobMatchScore.jsx          # Match badge indicator
│   │   │   │   ├── Description.jsx            # Detailed job description & application
│   │   │   │   ├── AppliedJob.jsx             # User application history
│   │   │   │   ├── Home.jsx                   # Landing page
│   │   │   │   ├── Jobs.jsx / Browse.jsx      # Job exploration views
│   │   │   │   ├── LatestJobs.jsx             # Featured jobs
│   │   │   │   ├── Filtercard.jsx             # Search filter controls
│   │   │   │   ├── EditProfileModal.jsx       # Profile editor modal
│   │   │   │   └── Footer.jsx                 # Application footer
│   │   │   ├── authentication/
│   │   │   │   ├── Login.jsx                  # Login view
│   │   │   │   ├── Register.jsx               # Registration view with role toggle
│   │   │   │   ├── VerifyOtp.jsx              # 6-digit OTP verification view
│   │   │   │   └── ResetPassword.jsx          # Password reset view
│   │   │   └── ui/                            # Shared UI components (shadcn/radix)
│   │   ├── redux/                             # Slices: auth, job, company, application, ai
│   │   └── utils/data.js                      # API base URL configuration
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── ai-service/                                # (Optional) Python FastAPI service
│   ├── main.py                                # API routers & endpoints
│   ├── services/                              # Matching, RAG, Interview, Resume, LLM
│   ├── requirements.txt                       # Python dependencies
│   └── .env.example
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Cloudinary Account** (Free tier for photo & resume hosting)
- **Gmail Account with Google Cloud OAuth2** (For OTP emails)
- *(Optional)* **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/mohithannadata12390/job-portal.git
cd job-portal
```

---

### Step 2: Configure and Run Backend

1. Navigate to the backend folder and install dependencies:
   ```bash
   cd Backend
   npm install
   ```

2. Create a `.env` file in the `Backend/` directory:
   ```env
   # Database
   MONGO_URI=your_mongodb_connection_string

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary (Resumes & Profile Photos)
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret

   # Server Configuration
   PORT=5011
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173

   # Email Service (Gmail OAuth2)
   EMAIL_USER=your_email@gmail.com
   CLIENT_ID=your_oauth_client_id
   CLIENT_SECRET=your_oauth_client_secret
   REFRESH_TOKEN=your_oauth_refresh_token

   # AI Configuration (Optional: Gemini 1.5 Flash)
   # If left empty, the built-in standalone fallback engine will be used automatically
   GEMINI_API_KEY=
   GEMINI_MODEL=gemini-1.5-flash
   ```

3. Launch the backend server:
   ```bash
   npm run dev
   ```
   *The backend will be running at `http://localhost:5011`.*

---

### Step 3: Configure and Run Frontend

1. In a new terminal, navigate to the frontend folder and install dependencies:
   ```bash
   cd Frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:5173`.*

---

### Step 4: (Optional) Run the Python AI Microservice

If you wish to use the dedicated Python embeddings and semantic analysis microservice:

1. Open a new terminal:
   ```bash
   cd ai-service
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure `.env` in `ai-service/`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   PORT=8000
   ```

4. Run the microservice:
   ```bash
   python main.py
   # Microservice will run at http://localhost:8000
   ```

---

## 📡 API Reference

Base URL: `http://localhost:5011`

### Authentication & User (`/api/user`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/register` | Public | Register new user and dispatch 6-digit OTP |
| `POST` | `/verify-otp` | Public | Verify signup OTP and auto-login |
| `POST` | `/resend-otp` | Public | Resend OTP code |
| `POST` | `/forgot-password` | Public | Request password-reset OTP |
| `POST` | `/reset-password` | Public | Reset password using OTP verification |
| `POST` | `/login` | Public | Authenticate user & set JWT cookie |
| `POST` | `/logout` | Public | Clear session & cookie |
| `POST` | `/profile/update` | Authenticated | Update user bio, skills, and resume |

### Jobs (`/api/job`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/get` | Public | Search and list all active job postings |
| `GET` | `/get/:id` | Public | Get single job details (with application state) |
| `POST` | `/post` | Recruiter | Post a new job listing |
| `GET` | `/getadminjobs` | Recruiter | List all jobs created by current recruiter |
| `PUT` | `/update/:id` | Recruiter | Update job details |
| `GET` | `/recommendations/:id` | Public | Get recommended jobs related to a job ID |

### Companies (`/api/company`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/register` | Recruiter | Register a new company |
| `GET` | `/get` | Recruiter | Retrieve companies registered by current recruiter |
| `GET` | `/get/:id` | Recruiter | Retrieve single company by ID |
| `PUT` | `/update/:id` | Recruiter | Update company profile and logo |

### Applications & ATS (`/api/application`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `GET` | `/apply/:id` | Student | Submit an application for a job |
| `GET` | `/get` | Student | Get all jobs applied by the current student |
| `GET` | `/:id/applicants` | Recruiter | Get all applicants for a specific job listing |
| `POST` | `/status/:id/update` | Recruiter | Update application status (`Accepted` / `Rejected`) |

### AI Suite (`/api/ai`)
| Method | Endpoint | Access | Description |
|:---|:---|:---|:---|
| `POST` | `/resume/upload` | Student | Upload resume PDF, extract and sync skills |
| `GET` | `/resume/analysis` | Student | Fetch extracted resume analysis |
| `GET` | `/match/job/:jobId` | Student | Calculate match percentage against job requirements |
| `GET` | `/match/candidates/:jobId` | Recruiter | Calculate match percentages for all job applicants |
| `POST` | `/student/chat` | Student | Query the Student AI Career Coach |
| `GET` | `/student/history` | Student | Retrieve student AI chat conversation history |
| `DELETE` | `/student/history` | Student | Clear student AI chat conversation history |
| `POST` | `/assistant/chat` | Recruiter | Query the Recruiter RAG Assistant |
| `GET` | `/assistant/history` | Recruiter | Retrieve recruiter AI assistant chat history |
| `DELETE` | `/assistant/history` | Recruiter | Clear recruiter AI assistant chat history |
| `POST` | `/interview/generate` | Recruiter | Generate tailored candidate interview questions |
| `GET` | `/interview/job/:jobId` | Recruiter | Get all generated interviews for a job |
| `GET` | `/interview/:id` | Recruiter | Fetch interview details |
| `POST` | `/interview/:id/submit` | Recruiter | Submit candidate answers for scoring |
| `POST` | `/interview/:id/evaluate` | Recruiter | Run AI evaluation on candidate answers |
| `POST` | `/report/generate` | Recruiter | Generate complete candidate hiring scorecard |
| `GET` | `/report/application/:applicationId` | Recruiter | Get hiring report by application ID |
| `GET` | `/report/:id` | Recruiter | Fetch hiring report by report ID |
| `POST` | `/report/:id/decide` | Recruiter | Record hiring decision on a report |

---

## 💡 Troubleshooting & FAQ

- **CORS Error**: Ensure `CORS_ORIGIN` in `Backend/.env` exactly matches your frontend URL (default: `http://localhost:5173`) without a trailing slash.
- **Gmail OTP Not Sending**: Verify that your Google Cloud OAuth2 credentials (`CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN`) have the Gmail API enabled and permissions granted.
- **AI Running Without API Key**: The platform includes an intelligent built-in fallback engine (`aiFallbackService.js`). You can test all features (Student Coach, Recruiter Assistant, Matching, Interviews, Reports) without providing a Gemini key. Adding `GEMINI_API_KEY` activates dynamic Gemini 1.5 Flash generation.
- **Resume Skills Extraction**: Skill parsing expects standard PDF documents. Cloudinary or Google Drive links are automatically fetched and analyzed.

---

## 👤 Author

**Mohith Annadatha**  
- GitHub: [@mohithannadata12390](https://github.com/mohithannadata12390)
- Repository: [job-portal](https://github.com/mohithannadata12390/job-portal)

---

## 📄 License

This project is licensed under the MIT License.
