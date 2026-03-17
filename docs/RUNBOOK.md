# Customer Success FTE - Operations Runbook

**System**: Customer Success Full-Time Equivalent (FTE)
**Version**: 1.0.0
**Last Updated**: 2026-03-17

---

## System Overview

The Customer Success FTE is an AI-powered customer support system that works 24/7 handling customer inquiries across three channels:
- **Email** (Gmail API)
- **WhatsApp** (Twilio API)
- **Web Form** (FastAPI endpoint)

### Architecture Components

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Gmail     │    │   WhatsApp   │    │   Web Form   │
│   (Email)    │    │  (Messaging) │    │  (Website)   │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│              FastAPI API Layer (Port 8000)              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Kafka Event Streaming                      │
│  Topics: fte.tickets.incoming, fte.escalations, etc.   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         Message Processor Worker (OpenAI Agent)         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         PostgreSQL Database (with pgvector)             │
│  Tables: customers, tickets, conversations, messages    │
└─────────────────────────────────────────────────────────┘
```

### Key Services

| Service | Port | Purpose |
|---------|------|---------|
| API | 8000 | FastAPI application |
| PostgreSQL | 5432 | Database |
| Kafka | 9092 | Event streaming |
| Frontend | 3000 | Next.js web form |

---

## Health Checks

### API Health Check

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-17T12:00:00Z",
  "environment": "production",
  "channels": {
    "email": "active",
    "whatsapp": "active",
    "web_form": "active"
  }
}
```

### Database Health Check

```bash
kubectl exec -it postgres-pod -n customer-success-fte -- pg_isready -U fte_user -d fte_db
```

### Kafka Health Check

```bash
kubectl exec -it kafka-pod -n kafka -- kafka-topics --bootstrap-server localhost:9092 --list
```

---

## Common Troubleshooting

### Issue 1: High Response Latency

**Symptoms:**
- Response time > 5 seconds
- Customer complaints about slow responses

**Diagnosis:**
```bash
# Check API pod CPU/memory
kubectl top pods -n customer-success-fte

# Check Kafka lag
kubectl exec -it kafka-pod -n kafka -- kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group fte-message-processor

# Check database connections
kubectl exec -it postgres-pod -n customer-success-fte -- psql -U fte_user -d fte_db -c "SELECT count(*) FROM pg_stat_activity;"
```

**Resolution:**
1. Scale up message processor workers:
   ```bash
   kubectl scale deployment fte-message-processor --replicas=10 -n customer-success-fte
   ```
2. Check for slow knowledge base queries
3. Review OpenAI API latency

---

### Issue 2: High Escalation Rate

**Symptoms:**
- Escalation rate > 30%
- Many tickets marked as "escalated"

**Diagnosis:**
```bash
# Check escalation reasons
kubectl logs -f deployment/fte-message-processor -n customer-success-fte | grep "Escalation trigger"

# Check escalation metrics
curl http://localhost:8000/metrics/channels
```

**Resolution:**
1. Review escalation triggers in agent prompts
2. Check knowledge base coverage for common questions
3. Adjust sentiment analysis threshold if too sensitive

---

### Issue 3: Channel Integration Failures

#### Gmail Integration Failure

**Symptoms:**
- Emails not being processed
- Gmail webhook returning errors

**Diagnosis:**
```bash
# Check Gmail handler logs
kubectl logs -f deployment/fte-api -n customer-success-fte | grep "Gmail"

# Test Gmail API connectivity
curl -X POST http://localhost:8000/webhooks/gmail \
  -H "Content-Type: application/json" \
  -d '{"message": {"historyId": "12345"}, "subscription": "test"}'
```

**Resolution:**
1. Verify Gmail credentials are valid:
   ```bash
   kubectl get secret fte-secrets -n customer-success-fte -o jsonpath='{.data.GMAIL_CREDENTIALS}' | base64 -d
   ```
2. Check Gmail API quota
3. Verify Pub/Sub subscription is active

#### WhatsApp Integration Failure

**Symptoms:**
- WhatsApp messages not being received
- Twilio webhook returning 403

**Diagnosis:**
```bash
# Check WhatsApp handler logs
kubectl logs -f deployment/fte-api -n customer-success-fte | grep "WhatsApp"

# Check Twilio signature validation
kubectl logs -f deployment/fte-api -n customer-success-fte | grep "Invalid signature"
```

**Resolution:**
1. Verify Twilio credentials
2. Check webhook URL is correctly configured in Twilio console
3. Verify system time is synchronized (signature validation is time-sensitive)

---

### Issue 4: Database Connection Issues

**Symptoms:**
- API returning 500 errors
- "Connection pool exhausted" in logs

**Diagnosis:**
```bash
# Check active connections
kubectl exec -it postgres-pod -n customer-success-fte -- psql -U fte_user -d fte_db -c "SELECT count(*) FROM pg_stat_activity;"

# Check connection pool settings
kubectl logs -f deployment/fte-api -n customer-success-fte | grep "pool"
```

**Resolution:**
1. Restart API pods to reset connection pool:
   ```bash
   kubectl rollout restart deployment/fte-api -n customer-success-fte
   ```
2. Increase connection pool size in config
3. Check for connection leaks in code

---

### Issue 5: OpenAI API Errors

**Symptoms:**
- Agent not responding
- "Rate limit exceeded" errors

**Diagnosis:**
```bash
# Check OpenAI API usage
kubectl logs -f deployment/fte-message-processor -n customer-success-fte | grep "OpenAI"

# Check rate limit errors
kubectl logs -f deployment/fte-message-processor -n customer-success-fte | grep "rate limit"
```

**Resolution:**
1. Check OpenAI API key is valid
2. Review usage limits in OpenAI dashboard
3. Implement request queuing if hitting rate limits

---

## Incident Response Procedures

### P1: Complete System Outage

**Definition:** All channels down, no customer inquiries being processed

**Response Time:** < 15 minutes

**Procedure:**
1. **Assess** (5 min)
   - Check health endpoints
   - Review recent deployments
   - Check infrastructure status

2. **Contain** (10 min)
   - Roll back recent changes if applicable
   - Restart critical services
   - Enable maintenance mode

3. **Recover** (30 min)
   - Restore from backup if needed
   - Gradually restore traffic
   - Monitor for recurrence

4. **Post-Mortem** (within 24 hours)
   - Document root cause
   - Implement preventive measures
   - Update runbook

---

### P2: Partial Outage (One Channel Down)

**Definition:** One channel (email/WhatsApp/web) not working

**Response Time:** < 1 hour

**Procedure:**
1. Identify affected channel
2. Check channel-specific logs
3. Restart affected handler
4. Verify channel recovery
5. Monitor for 30 minutes

---

### P3: Performance Degradation

**Definition:** Response time > 10 seconds or escalation rate > 40%

**Response Time:** < 4 hours

**Procedure:**
1. Scale up workers
2. Review recent changes
3. Check external dependencies
4. Optimize slow queries

---

## Monitoring & Alerting

### Key Metrics to Monitor

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Response Time (p95) | > 3 seconds | > 10 seconds |
| Escalation Rate | > 25% | > 40% |
| Error Rate | > 1% | > 5% |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |
| Database Connections | > 80% of pool | > 95% of pool |

### Alert Configuration

Configure alerts in your monitoring system (Prometheus/Grafana/Datadog):

```yaml
# Example Prometheus alert rule
groups:
- name: fte-alerts
  rules:
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is {{ $value }} seconds"
```

---

## Backup & Recovery

### Database Backup

**Frequency:** Daily at 2 AM UTC

**Backup Command:**
```bash
kubectl exec postgres-pod -n customer-success-fte -- \
  pg_dump -U fte_user fte_db > backup-$(date +%Y%m%d).sql
```

**Restore Command:**
```bash
kubectl exec -i postgres-pod -n customer-success-fte -- \
  psql -U fte_user fte_db < backup-20260317.sql
```

### Configuration Backup

Backup these Kubernetes resources regularly:
- ConfigMaps
- Secrets
- Deployments
- Services
- Ingress

```bash
kubectl get all -n customer-success-fte -o yaml > k8s-backup-$(date +%Y%m%d).yaml
```

---

## Deployment Procedures

### Standard Deployment

```bash
# 1. Build and push new image
docker build -t your-registry/customer-success-fte:v1.1.0 ./backend
docker push your-registry/customer-success-fte:v1.1.0

# 2. Update deployment image
kubectl set image deployment/fte-api fte-api=your-registry/customer-success-fte:v1.1.0 -n customer-success-fte

# 3. Monitor rollout
kubectl rollout status deployment/fte-api -n customer-success-fte

# 4. Verify health
curl http://<ingress-ip>/health
```

### Rollback Procedure

```bash
# Rollback to previous version
kubectl rollout undo deployment/fte-api -n customer-success-fte

# Verify rollback
kubectl rollout status deployment/fte-api -n customer-success-fte
```

---

## Contact Information

### On-Call Schedule

| Role | Name | Contact |
|------|------|---------|
| Primary | [Name] | [Phone/Email] |
| Secondary | [Name] | [Phone/Email] |
| Manager | [Name] | [Phone/Email] |

### Escalation Path

1. **Level 1**: On-call engineer (0-15 min)
2. **Level 2**: Team lead (15-30 min)
3. **Level 3**: Engineering manager (30-60 min)

---

## Appendix

### Useful Commands

```bash
# View all pods
kubectl get pods -n customer-success-fte

# View logs
kubectl logs -f deployment/fte-api -n customer-success-fte

# Execute command in pod
kubectl exec -it <pod-name> -n customer-success-fte -- bash

# Port forward for local debugging
kubectl port-forward svc/customer-success-fte 8000:80 -n customer-success-fte

# Check events
kubectl get events -n customer-success-fte --sort-by='.lastTimestamp'
```

### Log Locations

| Component | Log Location |
|-----------|--------------|
| API | `kubectl logs deployment/fte-api` |
| Message Processor | `kubectl logs deployment/fte-message-processor` |
| Metrics Collector | `kubectl logs deployment/fte-metrics-collector` |
| Database | `kubectl logs statefulset/postgres` |
| Kafka | `kubectl logs statefulset/kafka` |

### Configuration Files

| File | Purpose |
|------|---------|
| `backend/src/core/config.py` | Application settings |
| `k8s/manifests.yaml` | Kubernetes deployment |
| `docker-compose.yml` | Local development |
| `.env.example` | Environment variables template |

---

**Document Owner**: Engineering Team
**Review Frequency**: Quarterly
**Next Review**: 2026-06-17
