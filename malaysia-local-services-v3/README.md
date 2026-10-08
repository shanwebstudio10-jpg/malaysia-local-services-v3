# Servis Kita v3 - முழு வழிகாட்டி (VS Code → GitHub → Cloudflare)

Malaysia local services website: Services, Classifieds, Request form, WhatsApp button, Login, Photo upload, Reviews, BM/EN மொழி, Pagination, Admin panel.

## 0. முதலில் இதைப் புரிந்துகொள்ளுங்கள்

```
உங்கள் PC (VS Code)  ──git push──▶  GitHub  ──▶  Cloudflare
                                                   ├─ D1        = Database (தகவல் சேமிப்பு)
                                                   ├─ Worker    = Backend (API, login, admin)  ← folder: worker
                                                   └─ Pages     = Website (மக்கள் பார்ப்பது)    ← folder: frontend
```

- **Website (Pages)** மட்டும் இருந்தால் போதாது. தகவல் சேமிக்க **Backend (Worker) + Database (D1)** வேண்டும். மூன்றும் வேண்டும்.
- Worker URL (`...workers.dev`) என்பது API மட்டும்; அதைத் திறந்தால் website தெரியாது. Website URL `...pages.dev`.

## 1. எத்தனை Terminal வேண்டும்?

| எப்போது | Terminal எண்ணிக்கை | விளக்கம் |
|---|---|---|
| Local-இல் ஓட்டும்போது (சோதனை) | **2** | ஒன்று backend, ஒன்று website. இரண்டும் திறந்தே இருக்க வேண்டும். (scripts பயன்படுத்தினால் தானாகத் திறக்கும்) |
| GitHub-க்கு push செய்ய | **1** | புதிய terminal, project-இன் மேல் folder-இல் |
| Cloudflare deploy (Git வழி) | **0** | Dashboard-இல் browser மூலம் |

**எந்த folder-இல் என்பதை prompt-இல் பார்க்கவும்.** இதுவே பெரும்பாலான தவறுகளுக்குக் காரணம்.
- Project-இன் மேல் folder: `...\malaysia-local-services-v3>`
- Worker folder: `...\worker>`
- Frontend folder: `...\frontend>`

## 2. நிறுவ வேண்டியவை (ஒரு முறை)

1. **Node.js LTS**: https://nodejs.org → நிறுவிய பின் VS Code-ஐ மூடித் திறக்கவும். சோதிக்க: `node -v`
2. **Git**: https://git-scm.com/download/win → சோதிக்க: `git --version`
3. **GitHub account**: `shanwebstudio10-jpg`
4. **Cloudflare account** (free): https://dash.cloudflare.com

முதல் முறை Git பெயர்:
```
git config --global user.name "Shan"
git config --global user.email "உங்கள்-github-email"
```

## 3. VS Code-இல் Local-இல் ஓட்டுவது

1. ZIP-ஐ extract செய்யவும். VS Code → File → **Open Folder** → `malaysia-local-services-v3` (உள்ளே `frontend`, `worker`, `scripts` தெரிய வேண்டும்).
2. Terminal திறக்கவும்: **Ctrl + `**. Prompt `...malaysia-local-services-v3>` என்று முடிய வேண்டும்.

### வழி A: Script (எளிது, பரிந்துரை)
**ஒரு முறை மட்டும் (setup):**
```
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```
இது எல்லாவற்றையும் install செய்து local database உருவாக்கும்; `.dev.vars` file-உம் உருவாக்கும் (Admin password: `test123`).

**ஒவ்வொரு முறையும் ஓட்ட:**
```
powershell -ExecutionPolicy Bypass -File scripts\run-local.ps1
```
2 புதிய windows திறக்கும்; browser-இல் `http://localhost:5173` தானாகத் திறக்கும். **அந்த 2 windows-ஐ மூட வேண்டாம்.** நிறுத்த Ctrl + C.

### வழி B: கையால் (2 Terminal)
**Terminal 1 (Backend):**
```
cd worker
npm install
npm run db:local
```
`.dev.vars` file உருவாக்க (ஒரு முறை):
```
@"
ADMIN_PASSWORD=test123
JWT_SECRET=local-secret-local-secret-local-secret
"@ | Out-File -Encoding ascii .dev.vars
```
```
npm run dev
```
`Ready on http://localhost:8787` வரும் வரை காத்திருக்கவும்.

**Terminal 2 (Website)** — Terminal panel-இல் **+** அழுத்தி:
```
cd frontend
npm install
npm run dev
```
`http://localhost:5173/` திறக்கவும்.

### சோதனை
- Services tab-இல் 3 sample listings தெரிய வேண்டும்.
- Account tab-இல் account உருவாக்கவும்; Post tab-இல் listing போடவும்.
- Admin tab: password `test123` → Approve செய்யவும்.

## 4. GitHub-க்கு Push (1 Terminal)

### 4.1 Repo உருவாக்கம்
1. GitHub-இல் `shanwebstudio10-jpg` account-இல் உள்நுழையவும்.
2. https://github.com/new → Name: `malaysia-local-services` → **Private** → README/.gitignore எதையும் tick செய்ய வேண்டாம் → Create.

### 4.2 Push commands
Project-இன் மேல் folder-இல் (`...malaysia-local-services-v3>`):
```
git init
git add .
git commit -m "Servis Kita v3"
git branch -M main
git remote add origin https://github.com/shanwebstudio10-jpg/malaysia-local-services.git
git push -u origin main
```
- Login window வந்தால் **Sign in with browser** → **shanwebstudio10-jpg** account-இல் Authorize.
- `remote origin already exists` என்று வந்தால்: `git remote set-url origin https://github.com/shanwebstudio10-jpg/malaysia-local-services.git` செய்து, கடைசி `git push -u origin main` மட்டும் மீண்டும் செய்யவும்.
- வெற்றி: GitHub பக்கத்தை refresh செய்தால் `frontend`, `worker`, `scripts` தெரியும்.

`.gitignore` ஏற்கனவே உள்ளது; அதனால் `.env`, `.dev.vars` (passwords), `node_modules` GitHub-க்குப் போகாது.

## 5. Cloudflare (Dashboard, Terminal தேவையில்லை)

https://dash.cloudflare.com → உள்நுழையவும்.

### 5.1 Database (D1)
1. **Storage & Databases → D1 SQL Database → Create Database** → Name: `malaysia-local-services` → Create.
2. **Database ID**-ஐ copy செய்யவும்.
3. VS Code-இல் `worker/wrangler.toml` → `PASTE_DATABASE_ID_HERE` என்பதை அந்த ID-ஆல் மாற்றி Ctrl + S.
4. Terminal (project மேல் folder):
```
git add .
git commit -m "Add database id"
git push
```
5. D1 database பக்கத்தில் **Console** tab → `worker/schema.sql` முழுவதையும் copy செய்து ஒட்டி **Execute**.
   > இது ஏற்கனவே செய்திருந்தால் மீண்டும் செய்ய வேண்டாம். `schema.sql` பழைய data-வை அழிக்கும் (DROP TABLE).

### 5.2 Worker (Backend)
1. **Workers & Pages → Create → Import a repository** → GitHub-இல் `shanwebstudio10-jpg` account → repo `malaysia-local-services`.
2. Project name: `malaysia-local-services` (wrangler.toml-இல் உள்ள பெயருடன் ஒன்றாக)
3. **Root directory:** `worker`  |  **Deploy command:** `npx wrangler deploy` → Deploy.
4. Worker → **Settings → Variables and Secrets → Add** (Type: **Secret**):
   - `ADMIN_PASSWORD` = உங்கள் வலுவான password
   - `JWT_SECRET` = 40 random எழுத்துகள்
5. **சோதனை:** Worker URL-இன் இறுதியில் `/api/listings` சேர்த்துத் திறக்கவும் → `{"items":[...` வர வேண்டும்.

### 5.3 Pages (Website)
1. **Workers & Pages → Create → Pages → Connect to Git** → அதே repo.
2. **Root directory:** `frontend`
3. **Build command:** `npm run build`
4. **Build output directory:** `dist`
5. (விருப்பம்) Environment variable `VITE_API_URL` = உங்கள் Worker URL. இதை விட்டாலும் production-இல் `https://malaysia-local-services.shanwebstudio10.workers.dev` தானாகப் பயன்படுத்தப்படும். உங்கள் Worker URL வேறு என்றால் இதைக் கண்டிப்பாகச் சேர்க்கவும்.
6. **Save and Deploy** → `https://malaysia-local-services.pages.dev` கிடைக்கும். **இதுவே website.**

### 5.4 Git இல்லாமல் (மாற்று வழி)
Terminal-இல் ஒரு முறை `npx wrangler login` செய்து, பிறகு:
```
powershell -ExecutionPolicy Bypass -File scripts\deploy-backend.ps1
powershell -ExecutionPolicy Bypass -File scripts\deploy-frontend.ps1
```
Login fail ஆனால்: Dashboard → Pages → **Upload assets** → `frontend\dist` folder-ஐ drag செய்யவும் (முதலில் `cd frontend` பிறகு `npm run build`).

## 6. பிறகு மாற்றங்கள் செய்தால் (1 Terminal)
```
git add .
git commit -m "என்ன மாற்றினீர்கள்"
git push
```
Cloudflare 1-2 நிமிடத்தில் தானாக update செய்யும்.

## 7. பிரச்சினைகளும் தீர்வும்

| Error / பிரச்சினை | காரணம் | தீர்வு |
|---|---|---|
| `Cannot find module @rollup/rollup-win32-x64-msvc` | npm bug | `scripts\setup.ps1` ஓட்டவும். அல்லது `frontend`-இல்: `Remove-Item -Recurse -Force node_modules` பிறகு `npm install` |
| `Repository not found` | தவறான GitHub account/URL | `git remote set-url origin https://github.com/shanwebstudio10-jpg/malaysia-local-services.git`; பழைய login அழிக்க: `cmdkey /delete:LegacyGeneric:target=git:https://github.com` |
| `no upstream branch` | முதல் push | `git push -u origin main` |
| Cloudflare: `error occurred while fetching repository` | Cloudflare-க்கு repo அனுமதி இல்லை / push ஆகவில்லை | GitHub (`shanwebstudio10-jpg`) → Settings → Applications → Cloudflare Workers & Pages → Configure → repo சேர்க்கவும்; repo-வில் files இருக்கிறதா பார்க்கவும் |
| `wrangler login` → `request_forbidden` | Browser cookie பிரச்சினை | Dashboard-இல் login செய்து அதே browser-இல் மீண்டும் முயலவும்; அல்லது 5.4 மாற்று வழி / API token |
| Worker URL திறந்தால் `Not found` | சரிதான் — அது API | Website-க்கு `pages.dev` URL |
| Website-இல் `Failed to fetch` | Backend இயங்கவில்லை / API URL தவறு | Local: Terminal 1 ஓடுகிறதா பார்க்கவும். Cloudflare: Pages-இல் `VITE_API_URL` சரிபார்த்து மீண்டும் deploy |
| `Server error` (listings) | D1 tables இல்லை / database_id தவறு | 5.1 படிகள் 3 மற்றும் 5 |
| Register-இல் `JWT_SECRET ... missing` | Secret சேர்க்கவில்லை | 5.2 படி 4, பிறகு மீண்டும் deploy |
| Admin `Unauthorized` / `Wrong password` | `ADMIN_PASSWORD` தவறு | Secret-ஐ மீண்டும் set செய்து deploy |
| `npm` / `node` not recognized | Node இல்லை | Node LTS நிறுவி VS Code-ஐ மூடித் திறக்கவும் |
| `running scripts is disabled` | PowerShell கொள்கை | கட்டளைகளை `powershell -ExecutionPolicy Bypass -File ...` வடிவில் ஓட்டவும் |

## 8. பாதுகாப்பு
- Passwords-ஐ GitHub-க்குப் போடாதீர்கள் (`.gitignore` தடுக்கிறது). Cloudflare Secrets-இல் மட்டும் வையுங்கள்.
- Live site-க்கு `test123` பயன்படுத்த வேண்டாம்.
- Live ஆவதற்கு முன் Admin-இல் 3 sample listings-ஐ Delete செய்யவும்.

## 9. Project அமைப்பு
```
malaysia-local-services-v3/
├─ frontend/   React + Vite website (src/App.jsx, styles.css)
├─ worker/     Cloudflare Worker API (src/index.js), schema.sql, wrangler.toml
├─ scripts/    setup.ps1, run-local.ps1, deploy-backend.ps1, deploy-frontend.ps1
├─ .gitignore
└─ README.md
```
