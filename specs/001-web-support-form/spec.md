# Web Support Form Specification

**Feature Branch**: `001-web-support-form`  
**Created**: 2026-03-12  
**Status**: Ready for Implementation  
**Input**: CRM Digital FTE Factory Hackathon 5 - Web Form Requirement

---

## Purpose & Business Context

The Web Support Form is a **required deliverable** for the CRM Digital FTE Factory Hackathon 5. It serves as one of three primary intake channels (Email, WhatsApp, Web Form) for the Customer Success FTE agent.

### Business Goals
- Provide customers with a self-service support request submission mechanism
- Capture structured support tickets with proper categorization for AI agent routing
- Offer an embeddable widget that can be integrated into any website via a single `<script>` tag
- Ensure accessibility compliance for all users including those using assistive technologies
- Reduce support response time by auto-creating tickets with complete context

### User Scenarios

#### Scenario 1: Customer Submits Support Request (Primary Flow)
**As a** website visitor  
**I want to** submit a support request without leaving the current page  
**So that** I can get help quickly while continuing my workflow

**Acceptance Criteria**:
- Given I'm on any webpage with the embed script loaded
- When I click the floating support button
- Then a form modal opens without page reload
- When I fill all required fields correctly
- And I submit the form
- Then I see a success message with my ticket ID
- And the form resets for future use

#### Scenario 2: Customer Uploads Attachments
**As a** customer with a visual bug to report  
**I want to** attach screenshots to my support request  
**So that** the support team can see the issue I'm experiencing

**Acceptance Criteria**:
- Given I'm filling out the support form
- When I click the file upload area
- Then I can select up to 3 files
- And each file must be under 5MB
- And I see thumbnails for image files
- And I can remove individual files before submission

#### Scenario 3: Customer Returns to Incomplete Form
**As a** customer who was interrupted  
**I want to** find my partially completed form saved  
**So that** I don't have to re-enter all my information

**Acceptance Criteria**:
- Given I started filling the form but didn't submit
- When I return to the same browser within 7 days
- Then my previous entries are auto-loaded
- And I can continue editing or submit

#### Scenario 4: Form Validation Errors
**As a** customer making a typo  
**I want to** see clear error messages  
**So that** I can correct my mistakes before submission

**Acceptance Criteria**:
- Given I submit the form with missing required fields
- When validation fails
- Then I see specific error messages for each invalid field
- And the form doesn't submit
- And focus moves to the first error field

---

## Field Definitions & Validation Rules

### Field Specifications

| Field | Type | Required | Min | Max | Validation Rules |
|-------|------|----------|-----|-----|------------------|
| **name** | Text Input | Yes | 2 chars | 100 chars | Letters, spaces, hyphens, apostrophes only |
| **email** | Email Input | Yes | N/A | 254 chars | Valid email format (RFC 5322) |
| **subject** | Text Input | Yes | 5 chars | 200 chars | Any printable characters |
| **category** | Select Dropdown | Yes | N/A | N/A | One of: general, technical, billing, feedback, bug_report |
| **priority** | Select Dropdown | No | N/A | N/A | One of: low, medium (default), high |
| **message** | Textarea | Yes | 10 chars | 1000 chars | Any UTF-8 characters, show live counter |
| **attachments** | File Upload | No | 0 files | 3 files | Max 5MB per file, allowed: images, PDFs, text files |

### Validation Behavior

**Real-time Validation** (on blur):
- Email format validation
- Minimum character count for name, subject, message
- File size and count limits

**On Submit Validation**:
- All required fields completed
- Message length within limits
- No validation errors blocking submission

**Error Messages** (user-friendly):
- Name: "Please enter your name (at least 6 characters)"
- Email: "Please enter a valid email address (e.g., john@example.com)"
- Subject: "Please enter a subject (at least 5 characters)"
- Category: "Please select a category"
- Message: "Please describe your issue in more detail (minimum 10 characters)"
- Files: "File exceeds 5MB limit" or "Maximum 3 files allowed"

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Keyboard Navigation**:
- All interactive elements reachable via Tab key
- Focus visible with 3:1 contrast ratio focus ring
- Escape key closes modal
- Enter key submits form
- Arrow keys navigate dropdown options

**Screen Reader Support**:
- Semantic HTML structure (form, fieldset, legend)
- ARIA labels for all form fields
- ARIA live regions for error messages and success states
- ARIA-describedby for field help text
- Announce form open/close, success/error states

**Visual Accessibility**:
- Minimum contrast ratio 4.5:1 for text
- Minimum touch target 44x44 pixels
- Focus indicators visible (2px solid outline)
- No information conveyed by color alone
- Support for browser zoom up to 200%

**Cognitive Accessibility**:
- Clear, simple language
- Consistent layout and navigation
- Error messages explain how to fix
- Progress indication (character counter)
- Auto-save reduces memory load

---

## Security Considerations

### XSS Prevention
- All user input sanitized before display
- React's built-in XSS protection (no dangerouslySetInnerHTML)
- Content Security Policy headers recommended
- File names sanitized for display

### File Upload Security
- Client-side file type validation (MIME type check)
- File size limits enforced (5MB per file)
- File count limits enforced (max 3 files)
- Files converted to Base64 for preview (not uploaded to server in v1)
- Server-side validation required (backend responsibility)

### Data Protection
- No sensitive data stored in localStorage
- Form data cleared after successful submission
- HTTPS required for production deployment
- CORS headers configured on backend

### Rate Limiting
- Client-side debounce on submit button (prevent double submission)
- Backend rate limiting required (not client-side responsibility)

---

## Performance Goals

### Load Time
- Initial script load: < 100KB gzipped
- First Contentful Paint: < 1.5 seconds on 3G
- Time to Interactive: < 3 seconds on 3G

### Runtime Performance
- Form open animation: 60 FPS
- Input validation: < 16ms (no perceived lag)
- File preview generation: < 500ms for 5MB image
- Form submission: Optimistic UI update (show success immediately)

### Bundle Size Budget
- Embed script: < 50KB gzipped
- React runtime (shared): < 40KB gzipped
- Form component: < 30KB gzipped
- **Total**: < 120KB gzipped

### Caching Strategy
- Embed script: Cache-Control max-age=3600 (1 hour)
- Form data: localStorage with 7-day expiry
- Assets: Immutable cache for versioned files

---

## Embed Instructions

### Method 1: Script Tag (Recommended)

```html
<!-- Add before closing </body> tag -->
<script
  src="https://your-domain.com/embed.js"
  data-api-url="https://your-domain.com/api"
  data-position="bottom-right"
  data-theme="auto"
  async
></script>
```

**Configuration Options**:

| Data Attribute | Values | Default | Description |
|----------------|--------|---------|-------------|
| `data-api-url` | URL | `/api` | Backend API endpoint |
| `data-position` | `bottom-right`, `bottom-left`, `inline` | `bottom-right` | Widget position |
| `data-theme` | `light`, `dark`, `auto` | `auto` | Color theme |
| `data-accent-color` | Hex color | `#2563eb` | Primary button color |

### Method 2: Inline Embed

```html
<!-- Render form directly in page -->
<div
  id="support-widget"
  data-api-url="https://your-domain.com/api"
  data-embed="inline"
></div>
<script src="https://your-domain.com/embed.js" async></script>
```

### Method 3: iframe (Fallback)

```html
<iframe
  src="https://your-domain.com/support/embed"
  style="width: 100%; height: 600px; border: none;"
  title="Support Form"
></iframe>
```

### Window Configuration (Advanced)

```javascript
// Set config before script loads
window.SupportWidget = {
  config: {
    apiUrl: 'https://your-domain.com/api',
    position: 'bottom-right',
    theme: 'dark',
    accentColor: '#7c3aed',
    onOpen: () => console.log('Widget opened'),
    onClose: () => console.log('Widget closed'),
    onSubmit: (ticketId) => console.log('Ticket created:', ticketId)
  }
};
```

---

## Success & Error States

### Success State

**Visual Design**:
- Green checkmark icon (animated)
- "Thank You!" heading
- Ticket ID displayed in monospace font
- Brief confirmation message
- "Submit Another Request" button (resets form)
- Modal remains open

**Copy**:
```
Thank You!

Your support request has been submitted successfully.

Your Ticket ID: TK-123456

Our AI assistant will respond to your email within 5 minutes.
For urgent issues, responses are prioritized automatically.
```

### Error States

**Validation Error** (inline):
- Red border on invalid field
- Error message below field in red
- Icon indicating error type
- Focus moves to first error

**Submission Error** (toast):
```
Submission Failed

We couldn't submit your request. Please check your connection
and try again, or contact us at support@example.com.

[Try Again] [Cancel]
```

**File Upload Error** (inline):
```
⚠️ File too large
The file "screenshot.png" exceeds the 5MB limit.
Please compress the image or use a different file.
[Remove File]
```

**Network Error** (toast with retry):
```
Connection Error

Unable to reach our servers. Retrying in 3... 2... 1...

[Retry Now] [Cancel]
```

---

## Mobile UX Notes

### Layout Adaptations

**Screen Width < 640px**:
- Full-width form (no side margins)
- Stacked fields (no side-by-side)
- Larger touch targets (min 44px height)
- Bottom sheet modal (slides from bottom)
- Virtual keyboard handling (scroll into view)

**Touch Interactions**:
- Swipe down to close bottom sheet
- Tap outside to close modal
- Long press on file preview for options
- Pull-to-refresh disabled on form

**Performance on Mobile**:
- Lazy load file preview (only when scrolled into view)
- Reduce animation duration on low-power mode
- Defer non-critical JavaScript
- Use `touch-action: manipulation` for faster taps

**Accessibility on Mobile**:
- Support for mobile screen readers (VoiceOver, TalkBack)
- Proper input types for mobile keyboards (email, text)
- Prevent zoom on input focus (viewport meta tag)
- Sufficient spacing for motor impairments

---

## Assumptions

1. **Backend API**: Backend provides `/api/v1/support/submit` endpoint accepting POST requests with JSON body
2. **Ticket ID Format**: Backend returns ticket ID in format `TK-XXXXXX`
3. **File Handling**: Files are Base64 encoded and sent in JSON payload (backend may have separate upload endpoint for large files)
4. **CORS**: Backend configured to accept requests from domains where widget is embedded
5. **Browser Support**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
6. **JavaScript Required**: Widget requires JavaScript; no progressive enhancement for no-JS fallback (iframe method available)

---

## Out of Scope

- Multi-language support (i18n)
- Custom branding/theming per customer
- Analytics tracking (Google Analytics, etc.)
- Chatbot integration
- Voice/video call scheduling
- Knowledge base search within widget
- Customer authentication/login
- Payment processing
- Live chat handoff (future enhancement)

---

## Success Criteria

### Measurable Outcomes

**SC-001**: Users can complete and submit the form in under 2 minutes (measured via analytics)

**SC-002**: Form validation errors reduced by 50% compared to previous implementation (measured via error rate)

**SC-003**: 95% of users successfully submit on first attempt without validation errors

**SC-004**: Widget loads and becomes interactive in under 2 seconds on 3G connections

**SC-005**: Zero critical accessibility violations (WCAG 2.1 AA audit)

**SC-006**: 99.9% uptime for widget availability (measured via uptime monitoring)

**SC-007**: File upload success rate > 98% (failed uploads / total attempts)

**SC-008**: Mobile users represent < 60% of total submissions (indicating good mobile UX)

---

## Key Entities

### FormSubmission
- **name**: Customer's full name (string)
- **email**: Customer's email address (string, email format)
- **subject**: Brief description of issue (string)
- **category**: Support category (enum: general, technical, billing, feedback, bug_report)
- **priority**: Urgency level (enum: low, medium, high)
- **message**: Detailed description (string, 10-1000 chars)
- **attachments**: Array of file metadata (filename, size, type, base64 data)
- **submittedAt**: ISO 8601 timestamp
- **ticketId**: Returned from backend (string)

### DraftSubmission (localStorage)
- **formData**: Partial form values (object)
- **savedAt**: ISO 8601 timestamp
- **expiresAt**: ISO 8601 timestamp (7 days from save)

---

## Dependencies

### Required Backend Endpoints
- `POST /api/v1/support/submit` - Submit support form
- `GET /api/v1/support/ticket/:id` - Check ticket status (optional for v1)

### External Libraries (Frontend)
- React 18+
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui components
- Sonner (toasts)
- next-themes

---

**Next Steps**: 
1. Review and approve specification
2. Create implementation plan (`/sp.plan`)
3. Generate tasks (`/sp.tasks`)
4. Begin implementation (`/sp.implement`)
