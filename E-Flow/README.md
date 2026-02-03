<div align="center">

# 🎯 EngageFlow

### AI-Powered GTM Intelligence Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-engage--gtm--flow.lovable.app-FF6B6B?style=for-the-badge)](https://engage-gtm-flow.lovable.app)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<p align="center">
  <img src="public/favicon.png" alt="EngageFlow Logo" width="120" height="120" />
</p>

**Transform raw contact data into actionable GTM strategies with AI-powered segmentation and personalized outreach recommendations.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [API Reference](#-api-reference) • [Team](#-team)

</div>

---

## 🚀 Features

<table>
<tr>
<td width="50%">

### 🔍 Smart Contact Enrichment
Automatically enrich contact data with company information, job titles, funding stages, and tech stack details.

### 🤖 AI-Powered Segmentation
Leverage Gemini AI to intelligently segment contacts based on behavioral patterns, company attributes, and engagement signals.

</td>
<td width="50%">

### 📊 GTM Action Generation
Generate personalized nurture emails, content recommendations, sales routing rules, and product tweaks for each segment.

### 💬 Interactive AI Chatbot
Chat with your analysis data to get instant insights and recommendations using natural language.

</td>
</tr>
</table>

| Feature | Description |
|---------|-------------|
| 📥 **Webhook Integration** | Accept contact data via REST API for seamless automation |
| 📈 **Visual Analytics** | Interactive charts and graphs powered by Recharts |
| 📄 **PDF Export** | Export comprehensive reports with one click |
| 🔄 **Report Comparison** | Compare 2-5 analyses side-by-side to track trends |
| 🌙 **Dark Mode** | Full dark mode support for comfortable viewing |
| 📱 **Responsive Design** | Optimized for desktop, tablet, and mobile |

---

## 🛠 Tech Stack

<div align="center">

### Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcnui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=flat-square&logo=zustand&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=flat-square&logo=chart.js&logoColor=white)

### Backend

![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Deno](https://img.shields.io/badge/Deno-000000?style=flat-square&logo=deno&logoColor=white)
![Edge Functions](https://img.shields.io/badge/Edge_Functions-FF6B6B?style=flat-square&logo=cloudflare&logoColor=white)

### AI/ML

![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)
![FullEnrich API](https://img.shields.io/badge/FullEnrich-8B5CF6?style=flat-square&logo=api&logoColor=white)

### DevOps & Tools

![Lovable](https://img.shields.io/badge/Lovable-FF6B9D?style=flat-square&logo=heart&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)

</div>

---

## 📁 Project Structure

```
engageflow/
├── 📂 src/
│   ├── 📂 components/        # Reusable UI components
│   │   ├── 📂 chatbot/       # AI chatbot components
│   │   ├── 📂 landing/       # Landing page sections
│   │   ├── 📂 segments/      # Segment visualization
│   │   └── 📂 ui/            # shadcn/ui components
│   ├── 📂 hooks/             # Custom React hooks
│   ├── 📂 lib/               # Utility functions
│   ├── 📂 pages/             # Route pages
│   ├── 📂 store/             # Zustand state management
│   └── 📂 types/             # TypeScript definitions
├── 📂 supabase/
│   └── 📂 functions/         # Edge Functions
│       ├── analyze-segments/ # AI segmentation logic
│       ├── chat/             # Chatbot API
│       ├── enrich-contacts/  # Data enrichment
│       ├── generate-actions/ # GTM action generation
│       └── webhook-input/    # External data ingestion
└── 📂 public/                # Static assets
```

---

## 🏗 Architecture

```mermaid
flowchart TD
    A[📧 Email List Input] --> B[Webhook API]
    B --> C[Contact Enrichment]
    C --> D[🤖 Gemini AI Segmentation]
    D --> E[GTM Action Generation]
    E --> F[📊 Interactive Dashboard]
    F --> G[PDF Export]
    F --> H[💬 AI Chatbot]
    F --> I[Report Comparison]
    
    subgraph Backend [☁️ Supabase Backend]
        B
        C
        D
        E
        J[(PostgreSQL DB)]
    end
    
    subgraph Frontend [⚛️ React Frontend]
        F
        G
        H
        I
    end
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun**
- **npm** or **bun** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/engageflow.git
cd engageflow

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

## 📡 API Reference

### Webhook Endpoint

**POST** `/functions/v1/webhook-input`

Ingest contact data for automatic analysis.

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/webhook-input' \
  -H 'Content-Type: application/json' \
  -d '{
    "emails": ["john@company.com", "jane@startup.io"],
    "autoAnalyze": true
  }'
```

#### Request Body

| Field | Type | Description |
|-------|------|-------------|
| `emails` | `string[]` | Array of email addresses |
| `email` | `string` | Single email (alternative) |
| `contacts` | `object[]` | Array of contact objects with `email` field |
| `autoAnalyze` | `boolean` | Auto-start analysis (default: `true`) |

#### Response

```json
{
  "success": true,
  "message": "Received 5 email(s) - analysis started automatically",
  "analysis_id": "uuid-here",
  "emails_count": 5,
  "report_url": "/report/uuid-here"
}
```

---

## 📊 Data Flow

1. **Input** → Raw email addresses via UI or webhook
2. **Enrichment** → FullEnrich API adds company & contact data
3. **Segmentation** → Gemini AI clusters contacts into meaningful segments
4. **Actions** → AI generates personalized GTM strategies per segment
5. **Output** → Interactive dashboard, PDF reports, and chatbot insights


## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Team

<div align="center">
<table>
<tr>
<td align="center">
<strong>Caleb Oladepo</strong><br/>
<sub>Full Stack Developer</sub><br/>
<a href="https://github.com/Caleb-Tech001">
<img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"/>
</a>
<a href="https://linkedin.com/in/caleboladepo">
<img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white"/>
</a>
</td>
</tr>
</table>
</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
