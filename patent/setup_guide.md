# 🖥️ Setup Guide — Judicial Complexity & Litigation Risk Engine

Complete commands to run the project on a fresh laptop from scratch.

---

## ✅ Prerequisites — Install These First

### 1. Python 3.10
Download from https://www.python.org/downloads/release/python-31011/

> **Important:** During install, check **"Add Python to PATH"**

Verify:
```bash
python --version
# Expected: Python 3.10.x
```

### 2. Node.js 18+
Download from https://nodejs.org/en (LTS version)

Verify:
```bash
node --version    # Expected: v18.x.x or higher
npm --version     # Expected: 9.x.x or higher
```

### 3. Git (to clone / copy the project)
Download from https://git-scm.com/downloads

---

## 📁 Project Folder Structure

Copy the entire project folder to the new laptop. It should look like:

```
patent/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── models/
    ├── sota_complexity.pkl
    ├── tfidf_vectorizer.pkl
    └── mapper.json
```

> **Important:** The [models/](file:///c:/Users/rohit/OneDrive/Desktop/patent/backend/main.py#34-95) folder must be at `patent/models/` — not inside backend or frontend.

---

## ⚙️ Part 1: Backend Setup (Python / FastAPI)

Open **Terminal / PowerShell** in the `patent/backend/` folder.

### Step 1 — Create a virtual environment
```bash
python -m venv venv
```

### Step 2 — Activate the virtual environment

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

> You should see [(venv)](file:///c:/Users/rohit/OneDrive/Desktop/patent/frontend/src/App.js#10-162) in your terminal prompt.

### Step 3 — Install Python packages
```bash
pip install -r requirements.txt
```

> ⏳ This takes 5–10 minutes (downloads PyTorch, XGBoost, etc.)

> If you get a `torch` error on Windows, run this instead:
> ```bash
> pip install torch==2.2.2 --index-url https://download.pytorch.org/whl/cpu
> pip install -r requirements.txt
> ```

### Step 4 — (Windows only) Install Tesseract OCR for image support
Download from: https://github.com/UB-Mannheim/tesseract/wiki

Install to the default path: `C:\Program Files\Tesseract-OCR\`

### Step 5 — Start the backend server
```bash
python main.py
```

You should see:
```
✅  XGBoost complexity model loaded.
✅  TF-IDF vectorizer loaded (773 features).
✅  IPC→BNS mapper loaded (47 entries).
INFO:     Uvicorn running on http://0.0.0.0:8000
```

> Test it: Open http://localhost:8000/health in your browser — should return `{"status":"healthy"}`

---

## 🌐 Part 2: Frontend Setup (React)

Open a **new terminal window** in the `patent/frontend/` folder.

### Step 1 — Install Node.js packages
```bash
npm install
```

> ⏳ This takes 2–3 minutes.

### Step 2 — Start the frontend
```bash
npm start
```

This will automatically open http://localhost:3000 in your browser.

---

## 🚀 Quick Start (Every Time After First Setup)

Open **two terminal windows** in the project folder:

**Terminal 1 — Backend:**
```powershell
cd patent\backend
.\venv\Scripts\Activate.ps1
python main.py
```

**Terminal 2 — Frontend:**
```powershell
cd patent\frontend
npm start
```

Then open **http://localhost:3000** 🎉

---

## ❗ Troubleshooting

| Problem | Fix |
|---|---|
| `python: command not found` | Use `python3` instead. Or re-install Python with PATH enabled. |
| `Activate.ps1 cannot be loaded` | Run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `pip install` fails on `bitsandbytes` | Skip it: `pip install -r requirements.txt --ignore-requires-python` |
| `npm install` fails | Delete `node_modules/` and try again: `rm -rf node_modules && npm install` |
| Backend shows `Model not found` | Make sure [models/](file:///c:/Users/rohit/OneDrive/Desktop/patent/backend/main.py#34-95) folder is at `patent/models/` not inside `backend/` |
| Browser shows `Cannot connect to server` | Make sure backend is running (check Terminal 1 for errors) |
| Port 8000 already in use | Kill the old process or change port: `python main.py --port 8001` |
| Port 3000 already in use | React will ask to use port 3001 — type `Y` and press Enter |

---

## 📦 Package Summary

| Layer | Technology | Version |
|---|---|---|
| Backend API | FastAPI + Uvicorn | 0.109.0 / 0.27.0 |
| ML Model | XGBoost | 2.0.3 |
| NLP | scikit-learn TF-IDF | 1.4.0 |
| Deep Learning | PyTorch | 2.2.2 |
| PDF Parsing | pdfplumber + PyPDF2 | latest |
| OCR | pytesseract + Pillow | 0.3.10 / 10.2.0 |
| Frontend | React | 18.2.0 |
| Charts | Recharts | 2.10.3 |
| HTTP Client | Axios | 1.6.5 |
