# Quick Reference - GitHub Actions Setup

## 🚀 Quick Start (5 minutes)

### 1. Set GitHub Secrets
```
Go to: https://github.com/HamzaSheikh768/intelligent-support-fte/settings/secrets/actions

Add:
- KUBE_CONFIG = [your base64-encoded kubeconfig]
```

### 2. Set GitHub Variables
```
Go to: https://github.com/HamzaSheikh768/intelligent-support-fte/settings/variables/actions

Add:
- DOMAIN = yourdomain.com
- REGISTRY = ghcr.io/yourusername
```

### 3. Update k8s/secrets.yaml
```yaml
stringData:
  OPENROUTER_API_KEY: "your-actual-key"
  POSTGRES_PASSWORD: "your-actual-password"
```

### 4. Push to trigger workflows
```bash
git add .
git commit -m "fix: workflow updates"
git push origin main
```

---

## 📋 Required Configuration

### Secrets (Repository Settings → Secrets and variables → Actions → Secrets)

| Secret | Required | Example |
|--------|----------|---------|
| `KUBE_CONFIG` | Yes (for CD) | `base64-encoded-kubeconfig` |
| `OPENROUTER_API_KEY` | Yes | `sk-or-v1-...` |
| `POSTGRES_PASSWORD` | Yes | `secure-password-123` |
| `GMAIL_CREDENTIALS_JSON` | Optional | `{...}` |
| `TWILIO_ACCOUNT_SID` | Optional | `AC...` |
| `TWILIO_AUTH_TOKEN` | Optional | `...` |
| `TWILIO_WHATSAPP_NUMBER` | Optional | `whatsapp:+14155238886` |

### Variables (Repository Settings → Secrets and variables → Actions → Variables)

| Variable | Required | Example |
|----------|----------|---------|
| `DOMAIN` | Yes | `yourdomain.com` |
| `REGISTRY` | Yes | `ghcr.io/hamzasheikh768` |

---

## 🔧 Get KUBE_CONFIG

### Linux/Mac
```bash
cat ~/.kube/config | base64 -w 0
```

### Windows PowerShell
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Content ~/.kube/config -Raw)))
```

---

## ✅ Validation Commands

### Run Setup Script
```bash
# Linux/Mac
./scripts/setup-github-secrets.sh

# Windows
.\scripts\setup-github-secrets.ps1
```

### Validate k8s Files
```bash
# Linux/Mac
./scripts/validate-k8s.sh

# Manual check
ls k8s/*.yaml
```

### Test Frontend Locally
```bash
cd frontend
npm install
npm run typecheck
npm run build
```

---

## 🐛 Common Errors & Quick Fixes

### Error: `KUBE_CONFIG secret is not set`
**Fix:** Add KUBE_CONFIG to GitHub Secrets (see above)

### Error: `k8s/namespace.yaml not found`
**Fix:** Files already created in k8s/ directory

### Error: `Missing script: "typecheck"`
**Fix:** Already added to frontend/package.json

### Error: `Missing script: "test"`
**Fix:** Already added to frontend/package.json with Jest config

### Error: `DOMAIN variable is not set`
**Fix:** Add DOMAIN to GitHub Variables (see above)

### Error: `ImagePullBackOff`
**Fix:** 
1. Set REGISTRY variable correctly
2. Build and push Docker image first
3. Check image exists: `docker pull ${REGISTRY}/customer-success-fte:${SHA}`

---

## 📊 Workflow Status

| Workflow | Trigger | Status |
|----------|---------|--------|
| CI Frontend | Push/PR (frontend) | ✅ Fixed |
| CI Backend | Push/PR (backend) | ✅ Working |
| CD Deploy | Push to main | ✅ Fixed |

---

## 🔗 Quick Links

- **Workflow Runs:** https://github.com/HamzaSheikh768/intelligent-support-fte/actions
- **Troubleshooting Guide:** `.github/workflows/TROUBLESHOOTING.md`
- **Workflow README:** `.github/workflows/README.md`
- **Full Summary:** `WORKFLOW_FIXES_SUMMARY.md`

---

## 📱 Support

1. Check logs: Actions → [Workflow] → [Failed Job] → Download logs
2. Run validation: `./scripts/setup-github-secrets.sh`
3. Read troubleshooting: `.github/workflows/TROUBLESHOOTING.md`
4. Test locally: `act -j build-and-test`

---

**Last Updated:** 2026-03-17
**Status:** ✅ All workflows fixed and documented
