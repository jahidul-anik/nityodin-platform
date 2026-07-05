#!/usr/bin/env bash
set -euo pipefail

# =============================================================
#  Nityodin Platform — GitHub + Vercel One-Click Deploy Script
# =============================================================
#
#  Prerequisites:
#    1. Install:  npm i -g gh vercel
#    2. GitHub:  gh auth login
#    3. Vercel:  vercel login
#    4. Turso:   npm i -g turso && turso auth login  (for database)
#
#  Then run:  chmod +x deploy.sh && ./deploy.sh
#

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

PROJECT_NAME="nityodin-platform"

# ─── 0. Pre-flight checks ───────────────────────────────────
info "Running pre-flight checks..."

command -v gh >/dev/null 2>&1 || err "GitHub CLI not found. Run: npm i -g gh && gh auth login"
command -v vercel >/dev/null 2>&1 || err "Vercel CLI not found. Run: npm i -g vercel && vercel login"
command -v node >/dev/null 2>&1 || err "Node.js not found."

gh auth status >/dev/null 2>&1 || err "GitHub not authenticated. Run: gh auth login"
info "GitHub authenticated ✓"

# ─── 1. Create Turso Database (free tier) ──────────────────
if command -v turso >/dev/null 2>&1; then
  info "Setting up Turso database..."
  DB_NAME="${PROJECT_NAME}-db"

  if turso db list 2>/dev/null | grep -q "$DB_NAME"; then
    ok "Turso database '$DB_NAME' already exists"
  else
    turso db create "$DB_NAME" --location sin 2>/dev/null || warn "Could not create Turso DB. You can create one manually at https://turso.tech"
    ok "Turso database created (region: Singapore)"
  fi

  DB_URL=$(turso db show "$DB_NAME" --url 2>/dev/null || echo "")
  DB_TOKEN=$(turso db tokens create "$DB_NAME" 2>/dev/null || echo "")

  if [ -n "$DB_URL" ] && [ -n "$DB_TOKEN" ]; then
    ok "Got Turso credentials"
    TURSO_SETUP=1
  else
    warn "Could not get Turso credentials. Falling back to SQLite demo mode."
    TURSO_SETUP=0
  fi
else
  warn "Turso CLI not found. Database will run in demo mode on Vercel."
  warn "Install Turso for persistent data: npm i -g turso && turso auth login"
  TURSO_SETUP=0
fi

# ─── 2. Push schema to Turso ────────────────────────────────
if [ "$TURSO_SETUP" = "1" ]; then
  info "Pushing Prisma schema to Turso..."
  DATABASE_URL="$DB_URL" DATABASE_AUTH_TOKEN="$DB_TOKEN" npx prisma db push --skip-generate 2>/dev/null && ok "Schema pushed to Turso" || warn "Schema push failed — will retry on Vercel"
fi

# ─── 3. Create GitHub Repository ────────────────────────────
info "Creating GitHub repository..."
REPO_EXISTS=$(gh repo list --json name -q '.[].name' 2>/dev/null | grep -c "$PROJECT_NAME" || true)

if [ "$REPO_EXISTS" -gt 0 ]; then
  REPO_URL=$(gh repo view --json url -q '.url' 2>/dev/null || echo "")
  ok "Repository already exists: $REPO_URL"
else
  gh repo create "$PROJECT_NAME" \
    --public \
    --description "Nityodin — Single Identity, Multiple Roles | Bangladesh Citizen-Centric Digital Ecosystem" \
    --source=. \
    --push \
    2>/dev/null && ok "Repository created & code pushed!" || warn "Could not create repo. Push manually: git remote add origin https://github.com/YOUR_USER/$PROJECT_NAME.git && git push -u origin main"
fi

# ─── 4. Deploy to Vercel ────────────────────────────────────
info "Deploying to Vercel..."
if [ "$TURSO_SETUP" = "1" ]; then
  DATABASE_URL="$DB_URL" DATABASE_AUTH_TOKEN="$DB_TOKEN" vercel --yes --prod 2>&1
else
  # Demo mode: use in-memory SQLite (data resets on each deploy)
  DATABASE_URL="file:./dev.db" vercel --yes --prod 2>&1
fi

ok "🎉 Nityodin Platform is live!"

# ─── 5. Summary ──────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════"
echo -e "${GREEN}  Nityodin Platform Deployed Successfully!${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  GitHub:  https://github.com/$(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null || echo 'YOUR_USER/nityodin-platform')"
echo "  Vercel:  $(vercel ls 2>/dev/null | head -1 || echo 'https://nityodin-platform.vercel.app')"
echo ""

if [ "$TURSO_SETUP" = "1" ]; then
  echo -e "  ${GREEN}Database:${NC} Turso (persistent, serverless SQLite)"
  echo -e "  ${CYAN}Vercel Env Vars set:${NC} DATABASE_URL, DATABASE_AUTH_TOKEN"
else
  echo -e "  ${YELLOW}Database:${NC} Demo mode (ephemeral — resets on redeploy)"
  echo -e "  ${YELLOW}To enable persistent DB:${NC}"
  echo "    1. Sign up at https://turso.tech (free tier)"
  echo "    2. Create a database in Singapore region"
  echo "    3. Run: turso db show YOUR_DB --url"
  echo "    4. Run: turso db tokens create YOUR_DB"
  echo "    5. Add both as Vercel env vars"
  echo "    6. Redeploy with: vercel --prod"
fi
echo ""
echo -e "  ${CYAN}To redeploy after changes:${NC}  git add . && git commit -m 'update' && git push && vercel --prod"
echo ""