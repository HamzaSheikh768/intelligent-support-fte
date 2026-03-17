# 🚨 QUICK FIX: GitHub Actions Failures

## Issue: 3 Workflows Failing

### ❌ CD Deploy / deploy-staging - FAILING

**Error:** Missing GitHub Variables

**Fix:**

1. Go to: https://github.com/HamzaSheikh768/intelligent-support-fte/settings/variables/actions

2. Add these variables:

   | Variable Name | Value |
   |---------------|-------|
   | `REGISTRY` | `ghcr.io/hamzasheikh768` |
   | `DOMAIN` | `example.com` (or your actual domain) |

3. (Optional) Add secret if you have Kubernetes:
   - Go to: https://github.com/HamzaSheikh768/intelligent-support-fte/settings/secrets/actions
   - Add secret: `KUBE_CONFIG` (base64 encoded kubeconfig)

**Quick Fix (No Kubernetes):**
If you don't have Kubernetes setup, the deployment will fail. This is expected.
The workflow now has validation and will show clear error messages.

---

### ❌ CI Frontend / build-and-test - FAILING

**Likely Error:** Missing test scripts or build errors

**Fix:**

```bash
# Test locally first
cd frontend
npm install
npm run build
```

If build fails, check:
- TypeScript errors
- Missing dependencies
- Environment variables

**Temporary Fix (Skip Tests):**
Edit `.github/workflows/ci-frontend.yml` and add:
```yaml
- name: Run tests
  continue-on-error: true  # Add this
  working-directory: ./frontend
  run: npm test
```

---

### ❌ CI Backend / test - FAILING

**Likely Error:** Missing Dockerfile or test failures

**Fix:**

1. **Check if Dockerfile exists:**
```bash
ls backend/Dockerfile
```

2. **If missing, create it:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

3. **Run tests locally:**
```bash
cd backend
pip install -r requirements.txt
pytest
```

---

## 🚀 Immediate Actions

### Option 1: Fix Everything (Recommended)

```bash
# 1. Add GitHub Variables
# Go to repo settings and add REGISTRY and DOMAIN variables

# 2. Test locally
cd backend
python -m pytest

cd frontend
npm run build

# 3. Push fixes
git add .
git commit -m "fix: Resolve CI/CD pipeline issues"
git push
```

### Option 2: Disable Failing Checks (Quick Fix)

Edit workflows to make failing steps optional:

**`.github/workflows/cd-deploy.yml`:**
```yaml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    continue-on-error: true  # Add this
```

**`.github/workflows/ci-frontend.yml`:**
```yaml
- name: Run tests
  continue-on-error: true  # Add this
```

**`.github/workflows/ci-backend.yml`:**
```yaml
- name: Run tests
  continue-on-error: true  # Add this
```

---

## ✅ Verification

After fixes, workflows should pass or show clear error messages.

Monitor: https://github.com/HamzaSheikh768/intelligent-support-fte/actions
