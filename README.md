# PrepForge — JAMB & WAEC Practice App

A beautiful, fully offline Windows desktop app for JAMB UTME and WAEC SSCE exam preparation.

## Features

- **Mock Exam Mode** — Timed, CBT-style exam simulation with countdown timer
- **Study Mode** — Untimed with instant answer feedback and full explanations
- **Multi-subject support** — English, Maths, Physics, Chemistry, Biology, Economics, Government, and more
- **JAMB & WAEC** — Separate modes with correct question counts and timing
- **Question Navigator** — Jump to any question, flag questions for review
- **Results & Analytics** — Score breakdown per subject, question-by-question review
- **Exam History** — All past results with score trends chart
- **Offline-first** — SQLite database, no internet required after install

---

## Tech Stack

- **Tauri v2** (Rust backend, tiny native executable)
- **React 18 + TypeScript**
- **Vite** (fast dev server)
- **Tailwind CSS**
- **Zustand** (state management)
- **SQLite** via `tauri-plugin-sql`
- **Recharts** (analytics chart)

---

## Prerequisites

You need these installed on your Windows machine:

### 1. Rust
```
winget install Rustlang.Rust.MSVC
```
Or download from https://rustup.rs

### 2. Node.js (v18 or higher)
```
winget install OpenJS.NodeJS
```
Or download from https://nodejs.org

### 3. Visual Studio C++ Build Tools
Download "Build Tools for Visual Studio 2022" from:
https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

During install, select **"Desktop development with C++"**.

### 4. WebView2 (usually already installed on Windows 10/11)
If needed: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

---

## Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (opens the app window)
npm run tauri dev

# 3. Build a distributable .exe installer
npm run tauri build
```

The built installer will be at:
`src-tauri/target/release/bundle/nsis/PrepForge_1.0.0_x64-setup.exe`

---

## Adding Real Past Questions

The app ships with ~35 sample questions for demonstration. To add real JAMB/WAEC past questions, you can either:

### Option A: Direct SQLite insert
After the app has run once (creating the database), use DB Browser for SQLite
(https://sqlitebrowser.org/) to open:
`%APPDATA%\com.prepforge.app\prepforge.db`

Then run INSERT statements:
```sql
INSERT INTO questions 
  (exam_type, subject_id, year, question_number, question_text, 
   option_a, option_b, option_c, option_d, correct_answer, explanation, topic)
VALUES 
  ('JAMB', 'physics', 2024, 1, 'Your question text here?',
   'Option A text', 'Option B text', 'Option C text', 'Option D text',
   'B', 'Explanation of why B is correct.', 'Topic Name');
```

### Option B: Seed script
Create a `scripts/seed.js` file and run `node scripts/seed.js` to bulk-insert
questions from a JSON array into the database.

### Subject IDs reference
| Subject | ID |
|---|---|
| Use of English | `english` |
| Mathematics | `mathematics` |
| Physics | `physics` |
| Chemistry | `chemistry` |
| Biology | `biology` |
| Economics | `economics` |
| Literature | `literature` |
| Government | `government` |
| Geography | `geography` |
| Commerce | `commerce` |
| Accounting | `accounting` |
| Agricultural Science | `agricultural_science` |
| Further Mathematics | `further_mathematics` |
| Civic Education | `civic_education` |

---

## Project Structure

```
prepforge/
├── src-tauri/          # Rust / Tauri backend
│   ├── src/
│   │   ├── main.rs     # Entry point
│   │   └── lib.rs      # DB migrations, Tauri setup
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/                # React frontend
│   ├── components/
│   │   ├── Layout.tsx      # Sidebar + outlet
│   │   ├── Timer.tsx       # Countdown timer
│   │   └── QuestionCard.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx   # Home with stats + chart
│   │   ├── SubjectSelect.tsx
│   │   ├── ExamRoom.tsx    # CBT interface
│   │   ├── ResultSummary.tsx
│   │   └── History.tsx
│   ├── store/
│   │   └── useExamStore.ts # Zustand exam state
│   ├── db/
│   │   ├── queries.ts      # SQLite queries + seeder
│   │   └── subjects.ts     # Subject config
│   └── types/index.ts
│
├── package.json
└── README.md
```

---

## Roadmap (V2)

- [ ] Topic-by-topic practice filter
- [ ] Dark/Light mode toggle
- [ ] Export results to PDF
- [ ] Bulk question import via CSV/Excel
- [ ] Explanatory images for diagrams
- [ ] Sound effects for correct/wrong answers
