# Domain-Checker

A fast, minimal domain availability checker built with React + Vite. Type any company name and instantly see availability across .com, .io, .dev, .co, .net, .ai, .app, .tech, .cloud, .software, and **.lk** (Sri Lanka). Each result shows the site where that domain can be registered. Click **Register** to see only registrars that support that TLD (e.g. for .lk: Namecheap, GoDaddy, NIC.LK).

Built with **React + Vite**.

---

## 🚀 Deploy to Netlify (Step-by-Step)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/domain-checker.git
git push -u origin main
```

### 2. Deploy on Netlify

1. Go to [netlify.com](https://www.netlify.com) and log in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account and select the `domain-checker` repo
4. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Deploy site"** ✅

Netlify will auto-deploy every time you push to `main`.

---

## 💻 Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🛠 Tech Stack

- React 18
- Vite 5
- Google Fonts (Bebas Neue, Outfit, DM Mono)

---

> ⚠️ Domain availability is simulated. Always verify on your chosen registrar before purchasing.
