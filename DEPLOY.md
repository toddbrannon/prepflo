# PrepFlo — New Client Deployment Guide

A step-by-step checklist for deploying a new client instance of PrepFlo.
Each client gets their own GitHub repo, Render services, and Postgres database.

---

## Prerequisites

- Access to GitHub (github.com/toddbrannon)
- Access to Render dashboard (render.com)
- Access to DNS settings for prepflo.app
- Node.js and pnpm installed locally
- Render CLI installed (`npm install -g @render-com/cli`)

---

## Step 1 — Create the Client GitHub Repo

1. Go to github.com and create a new **empty** repository
   - Name: `clientname-prepflo` (e.g. `legacy-prepflo`)
   - Visibility: Private
   - Do NOT add README, .gitignore, or license

---

## Step 2 — Clone and Push Template

```bash
# Clone the master PrepFlo repo
git clone https://github.com/toddbrannon/prepflo.git clientname-prepflo
cd clientname-prepflo

# Point to the new client repo
git remote set-url origin https://github.com/toddbrannon/clientname-prepflo.git

# Push template branch as main to the client repo
git push origin template:main
```

Verify on GitHub that the client repo now has a `main` branch with clean code.

---

## Step 3 — Create Render Postgres Database

1. Render Dashboard → New → PostgreSQL
2. Name: `clientname-db`
3. Region: Oregon (US West) — or closest to client
4. Plan: Free (upgrade when client goes live)
5. Click **Create Database**
6. Once created, copy the **Internal Database URL** — you will need it in Step 5

---

## Step 4 — Create Render Web Service (API)

1. Render Dashboard → New → Web Service
2. Connect GitHub repo: `clientname-prepflo`
3. Branch: `main`
4. Name: `clientname-prepflo-api`
5. Root Directory: `artifacts/api-server`
6. Build Command: `pnpm install && pnpm build`
7. Start Command: `pnpm start`
8. Instance Type: Free

---

## Step 5 — Set Web Service Environment Variables

In the Web Service → Environment, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `JWT_SECRET` | *(generate with `openssl rand -base64 32`)* |
| `DATABASE_URL` | *(Internal Database URL from Step 3)* |

Click **Save Changes** — the service will redeploy automatically.

---

## Step 6 — Create Render Static Site (Frontend)

1. Render Dashboard → New → Static Site
2. Connect GitHub repo: `clientname-prepflo`
3. Branch: `main`
4. Name: `clientname-prepflo-frontend`
5. Root Directory: `artifacts/main-app`
6. Build Command: `pnpm install && pnpm build`
7. Publish Directory: `dist/public`

---

## Step 7 — Set Static Site Environment Variables

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://clientname-prepflo-api.onrender.com` |

---

## Step 8 — Initialize the Database

Once the Web Service is live, register the first admin user:

```bash
curl -X POST https://clientname-prepflo-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clientdomain.com","password":"securepassword","name":"Admin Name"}'
```

Registration is locked after the first user is created.

---

## Step 9 — Configure Custom Subdomain

1. Go to your DNS provider for `prepflo.app`
2. Add a CNAME record:
   - Name: `clientname`
   - Value: `clientname-prepflo-frontend.onrender.com`
3. In Render → Static Site → Settings → Custom Domains
4. Add: `clientname.prepflo.app`
5. Render will provision SSL automatically

The client app will be live at `https://clientname.prepflo.app`

---

## Step 10 — Verify Deployment

- [ ] `https://clientname.prepflo.app` loads the login screen
- [ ] Login works with the credentials from Step 8
- [ ] API health check returns OK: `https://clientname-prepflo-api.onrender.com/api/health`
- [ ] SSL certificate is active (padlock in browser)

---

## Client Record Template

Keep a record for each deployed client:
Client Name:
GitHub Repo:
Render API Service:
Render Frontend Service:
Render Database:
Subdomain:
Admin Email:
Deployed Date:
Plan:
Notes:

---

## Generating a JWT Secret

```bash
openssl rand -base64 32
```

Never reuse JWT secrets across clients. Each deployment gets its own.

---

## Updating a Client Deployment

When you ship new features and want to update a client:

```bash
# In the client repo
git pull origin main

# Or cherry-pick specific commits from the master prepflo repo
git remote add upstream https://github.com/toddbrannon/prepflo.git
git fetch upstream
git cherry-pick <commit-hash>
git push origin main
```

Render auto-deploys on every push to main.
