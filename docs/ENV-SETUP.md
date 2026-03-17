# Environment Setup Guide

**Last Updated**: 2026-03-12  
**Version**: 1.0.0

---

## Overview

This guide explains how to configure environment variables for the Customer Success FTE application.

---

## Quick Start

### 1. Copy Environment Files

```bash
# Root directory
cp .env.example .env

# Backend directory
cp backend/.env.example backend/.env

# Frontend directory
cp frontend/.env.example frontend/.env
```

### 2. Edit .env Files

Open each `.env` file and replace placeholder values with your actual credentials.

### 3. Verify Configuration

```bash
# Test backend configuration
docker-compose up backend

# Test frontend configuration
cd frontend && npm run dev
```

---

## Required Variables (Must Configure)

### OpenRouter API Key

**Variable**: `OPENROUTER_API_KEY`
**Where to get**: https://openrouter.ai/keys
**Format**: `sk-or-...`

```bash
OPENROUTER_API_KEY=sk-or-your-actual-key-here
```

**Optional Model Configuration**:
```bash
OPENROUTER_MODEL=gpt-4o
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### Database Password

**Variable**: `POSTGRES_PASSWORD`  
**Default**: `fte_password`  
**Recommendation**: Change to a strong password in production

```bash
POSTGRES_PASSWORD=your-secure-password
```

### Gmail API Credentials (Optional)

**Variables**: 
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_CREDENTIALS_PATH`

**Where to get**: https://console.cloud.google.com/apis/credentials

1. Create a new project in Google Cloud Console
2. Enable Gmail API
3. Create OAuth 2.0 credentials
4. Download credentials JSON file

### Twilio Credentials (Optional)

**Variables**:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`

**Where to get**: https://www.twilio.com/console

1. Sign up for Twilio account
2. Get Account SID and Auth Token from console
3. Set up WhatsApp sandbox or production number

---

## Optional Variables

### Redis (Caching)

**Default**: Not configured  
**When to use**: For production caching

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Sentry (Error Tracking)

**Default**: Not configured  
**When to use**: For production error tracking

```bash
SENTRY_DSN=https://your-sentry-dsn
```

---

## Security Best Practices

### DO:
- ✅ Use strong, unique passwords
- ✅ Rotate API keys regularly
- ✅ Use environment-specific values
- ✅ Store secrets in a secure vault (production)
- ✅ Use `.env` files (not committed to git)

### DON'T:
- ❌ Commit `.env` files to version control
- ❌ Use default passwords in production
- ❌ Share API keys via email/chat
- ❌ Hardcode secrets in code
- ❌ Use production keys in development

---

## Environment-Specific Configuration

### Development

```bash
ENVIRONMENT=development
LOG_LEVEL=DEBUG
DEBUG=true
```

### Staging

```bash
ENVIRONMENT=staging
LOG_LEVEL=INFO
DEBUG=false
```

### Production

```bash
ENVIRONMENT=production
LOG_LEVEL=WARNING
DEBUG=false
SECRET_KEY=<strong-random-key>
```

---

## Troubleshooting

### Backend Won't Start

**Error**: "Database connection failed"

**Solution**: Check `DATABASE_URL` matches your PostgreSQL credentials

```bash
# Test database connection
docker-compose exec postgres psql -U fte_user -d fte_db -c "SELECT 1"
```

### OpenAI API Errors

**Error**: "Invalid API key"

**Solution**: Verify `OPENROUTER_API_KEY` is correct and has credits

```bash
# Test OpenRouter API
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### Gmail Integration Not Working

**Error**: "Authentication failed"

**Solution**: 
1. Verify Gmail credentials are correct
2. Check Gmail API is enabled
3. Ensure OAuth consent screen is configured

### Twilio WhatsApp Not Working

**Error**: "Invalid credentials"

**Solution**:
1. Verify Account SID and Auth Token
2. Check WhatsApp number is approved
3. Test webhook URL is accessible

---

## Production Deployment

### Using Kubernetes Secrets

```bash
# Create secret
kubectl create secret generic fte-secrets \
  --from-literal=OPENROUTER_API_KEY=your-key \
  --from-literal=POSTGRES_PASSWORD=your-password \
  -n customer-success-fte
```

### Using Docker Secrets

```yaml
# docker-compose.yml
secrets:
  openrouter_key:
    file: ./secrets/openrouter_key.txt
  db_password:
    file: ./secrets/db_password.txt
```

### Using Environment Variables in CI/CD

```yaml
# .github/workflows/cd-deploy.yml
env:
  OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
  POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
```

---

## Validation Checklist

Before deploying to production:

- [ ] All required variables configured
- [ ] Strong passwords used
- [ ] API keys rotated from defaults
- [ ] Environment-specific values set
- [ ] Secrets not in version control
- [ ] Backup of .env file stored securely
- [ ] Team members have access to credentials
- [ ] Credential rotation schedule defined

---

## Support

For issues with environment configuration:

1. Check this guide
2. Review logs: `docker-compose logs`
3. Test individual components
4. Contact DevOps team

---

**Next Steps**: After configuring environment variables, proceed to deployment guide in `docs/DEPLOYMENT.md`
