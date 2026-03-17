# TaskFlow Pro - Product Documentation

## Overview

TaskFlow Pro is a comprehensive project management and team collaboration platform designed for modern remote and hybrid teams.

---

## Getting Started

### Creating Your First Project

1. **Log in** to your TaskFlow Pro account
2. Click **"+ New Project"** in the top navigation
3. Choose a template or start from scratch
4. Name your project and set visibility (Public/Private)
5. Invite team members via email

### Inviting Team Members

1. Go to **Project Settings** → **Members**
2. Click **"Invite Members"**
3. Enter email addresses (separate multiple with commas)
4. Choose role: Admin, Member, or Viewer
5. Click **"Send Invites"**

Team members receive an email with a link to join the project.

---

## Features & How-To Guides

### 1. Project Boards

#### Creating a Board

**Steps**:
1. Open your project
2. Click **"Boards"** in the left sidebar
3. Click **"+ New Board"**
4. Choose board type: Kanban, List, or Timeline
5. Name your board and click **"Create"**

#### Customizing Workflows

**To add custom statuses**:
1. Go to **Board Settings** → **Workflow**
2. Click **"+ Add Status"**
3. Name the status (e.g., "In Review", "Blocked")
4. Choose a color for visual identification
5. Drag to reorder workflow stages

#### Moving Tasks

- **Drag and drop** cards between columns
- Use **keyboard shortcuts**: `←` `→` to move horizontally
- Click the task → **Status dropdown** to change status

---

### 2. Task Management

#### Creating a Task

**Quick Create** (from any board):
1. Click **"+ Add Task"** at the bottom of any column
2. Enter task title
3. Press `Enter` to save

**Detailed Create**:
1. Click **"+ New Task"** in the top bar
2. Fill in details:
   - Title (required)
   - Description (markdown supported)
   - Assignee
   - Due date
   - Priority (Low, Medium, High, Urgent)
   - Tags
3. Click **"Create Task"**

#### Setting Due Dates

1. Open the task
2. Click the **calendar icon** next to "Due Date"
3. Select a date from the calendar
4. (Optional) Set a specific time
5. Click **"Save"**

**Reminder Options**:
- No reminder
- 15 minutes before
- 1 hour before
- 1 day before
- 1 week before

#### Adding Attachments

1. Open the task
2. Scroll to **"Attachments"** section
3. Click **"Upload"** or drag files into the area
4. **Supported formats**: Images, PDFs, documents, spreadsheets
5. **Max file size**: 25MB per file (50MB for Professional+)

---

### 3. Time Tracking

#### Starting Time Tracking

**Manual Start**:
1. Open the task
2. Click the **▶️ Play button** next to "Time Tracking"
3. Timer starts automatically
4. Click **⏹️ Stop** when done

**Manual Entry** (for forgotten tracking):
1. Open the task
2. Click **"Log Time"**
3. Enter date and duration
4. Add a description (optional)
5. Click **"Log"**

#### Viewing Time Reports

1. Go to **Reports** → **Time Tracking**
2. Filter by:
   - Date range
   - Project
   - Team member
   - Task
3. Export as CSV or PDF

---

### 4. Collaboration Features

#### Comments & Mentions

**Adding a Comment**:
1. Open the task
2. Scroll to **"Comments"** section
3. Type your message
4. Use **@name** to mention team members
5. Click **"Post"**

**Formatting Options**:
- `**bold**` → **bold**
- `*italic*` → *italic*
- `` `code` `` → `code`
- `[link text](url)` → clickable links

#### File Sharing

**In Comments**:
1. Click the **paperclip icon** in the comment box
2. Select files to upload
3. Add your comment
4. Click **"Post"**

**Shared Files View**:
1. Go to **Project** → **Files**
2. See all files shared in the project
3. Filter by file type or uploader
4. Download or preview any file

---

### 5. Reporting & Analytics

#### Burndown Chart

**Access**: Reports → Burndown Chart

**Shows**:
- Remaining work over time
- Ideal burndown line
- Actual progress
- Sprint completion prediction

**Use Case**: Track sprint progress and identify if you're on track

#### Team Velocity

**Access**: Reports → Velocity

**Shows**:
- Story points completed per sprint
- Average velocity over last 6 sprints
- Velocity trend (increasing/decreasing)

**Use Case**: Plan future sprint capacity

#### Custom Reports

**Create Custom Report**:
1. Go to **Reports** → **Custom Reports**
2. Click **"+ New Report"**
3. Choose metrics:
   - Tasks created/completed
   - Time tracked
   - Cycle time
   - Cumulative flow
4. Add filters (project, assignee, date range)
5. Choose visualization (chart, table, pivot)
6. Click **"Save Report"**

---

## Integrations

### Slack Integration

**Setup**:
1. Go to **Settings** → **Integrations** → **Slack**
2. Click **"Connect to Slack"**
3. Authorize TaskFlow Pro in Slack
4. Choose which notifications to receive
5. Select default Slack channel

**Features**:
- Receive task notifications in Slack
- Create tasks from Slack messages
- Update task status with slash commands (`/taskflow`)

### GitHub Integration

**Setup**:
1. Go to **Settings** → **Integrations** → **GitHub**
2. Click **"Connect GitHub"**
3. Authorize TaskFlow Pro
4. Select repositories to link
5. Choose which events create tasks

**Features**:
- Automatically create tasks from issues
- Link commits to tasks
- Show pull request status in tasks

### Google Drive Integration

**Setup**:
1. Go to **Settings** → **Integrations** → **Google Drive**
2. Click **"Connect Google Drive"**
3. Sign in to your Google account
4. Grant TaskFlow Pro access

**Features**:
- Attach Drive files to tasks
- Real-time collaboration on documents
- Automatic sync of file changes

---

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Create new task | `Ctrl + N` | `Cmd + N` |
| Search | `Ctrl + K` | `Cmd + K` |
| Go to dashboard | `G` then `D` | `G` then `D` |
| Go to projects | `G` then `P` | `G` then `P` |
| Mark task complete | `Ctrl + Enter` | `Cmd + Enter` |
| Assign to me | `A` then `M` | `A` then `M` |
| Set due date | `D` | `D` |
| Add label | `L` | `L` |
| Comment | `C` | `C` |
| Undo | `Ctrl + Z` | `Cmd + Z` |

---

## Troubleshooting

### Common Issues

**"I can't see my project"**
- Check that you're logged in to the correct account
- Verify you've been added as a member to the project
- Contact your project admin for access

**"Tasks aren't loading"**
- Refresh the page (`F5` or `Ctrl+R` / `Cmd+R`)
- Check your internet connection
- Clear browser cache and cookies
- Try incognito/private mode

**"I'm not receiving email notifications"**
- Check your spam/junk folder
- Go to **Settings** → **Notifications** and verify email is enabled
- Add `noreply@taskflowpro.com` to your contacts
- Check if you've accidentally unsubscribed

**"Time tracking shows incorrect duration"**
- Time zones may be different from your local time
- Check your profile settings for correct time zone
- Manually adjust logged time if needed

---

## Account & Billing

### Upgrading Your Plan

1. Go to **Settings** → **Billing**
2. Click **"Upgrade Plan"**
3. Choose your plan (Starter, Professional, Enterprise)
4. Enter payment details
5. Click **"Subscribe"**

**Billing Cycle**: Monthly or annual (save 20% with annual)

### Canceling Subscription

1. Go to **Settings** → **Billing**
2. Click **"Cancel Subscription"**
3. Choose a reason (optional)
4. Confirm cancellation
5. You retain access until the end of your billing period

### Data Export

**Export Your Data**:
1. Go to **Settings** → **Privacy**
2. Click **"Export Data"**
3. Choose format: JSON or CSV
4. Click **"Request Export"**
5. Download link sent to your email (within 24 hours)

---

## Security & Privacy

### Two-Factor Authentication (2FA)

**Enable 2FA**:
1. Go to **Settings** → **Security**
2. Click **"Enable Two-Factor Authentication"**
3. Scan QR code with authenticator app (Google Authenticator, Authy)
4. Enter the 6-digit code
5. Save backup codes in a secure location

### Data Encryption

- **In Transit**: TLS 1.3 encryption
- **At Rest**: AES-256 encryption
- **Backups**: Encrypted, stored in separate geographic region

### GDPR Compliance

- Right to access your data
- Right to rectification (correct data)
- Right to erasure ("right to be forgotten")
- Right to data portability
- Right to object to processing

**To exercise these rights**: Contact privacy@taskflowpro.com

---

## Contact Support

### Help Center

Visit: **help.taskflowpro.com**

- Browse articles by category
- Search for specific topics
- Watch video tutorials
- Join community forums

### Submit a Ticket

1. Go to **Help Center** → **"Submit a Request"**
2. Or email: **support@taskflowpro.com**
3. Include:
   - Your account email
   - Detailed description of the issue
   - Screenshots (if applicable)
   - Steps to reproduce

### Response Times

| Plan | Response Time |
|------|---------------|
| Free | 48 hours |
| Starter | 24 hours |
| Professional | 12 hours |
| Enterprise | 1 hour (24/7) |

### Live Chat

**Available for**: Professional and Enterprise plans  
**Hours**: 24/7 for Enterprise, 9 AM - 9 PM PST for Professional  
**Access**: Click the chat bubble in the bottom-right corner

---

**Last Updated**: March 2026  
**Version**: 3.5.0
