# Web Support Form Integration Guide

**Version**: 1.0.0  
**Last Updated**: 2026-03-12

---

## Quick Start

The Web Support Form can be integrated into any website using a single `<script>` tag.

### Method 1: Embed Script (Recommended)

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

This creates a floating support button in the bottom-right corner of your website.

### Method 2: Direct Link

Link directly to the support form page:

```html
<a href="https://support.your-domain.com" target="_blank">
  Contact Support
</a>
```

### Method 3: iframe Embed

Embed the form in an iframe:

```html
<iframe
  src="https://support.your-domain.com"
  style="width: 100%; height: 600px; border: none;"
  title="Support Form"
></iframe>
```

---

## Configuration

### Data Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-api-url` | URL | `/api` | Backend API endpoint |
| `data-position` | `bottom-right`, `bottom-left` | `bottom-right` | Widget position |
| `data-theme` | `light`, `dark`, `auto` | `auto` | Color theme |
| `data-accent-color` | Hex color | `#2563eb` | Primary button color |

### JavaScript Configuration

For advanced configuration, use the global `SupportWidget` object:

```javascript
window.SupportWidget = {
  config: {
    apiUrl: 'https://your-domain.com/api',
    position: 'bottom-right',
    theme: 'dark',
    accentColor: '#7c3aed',
  },
  onOpen: () => console.log('Widget opened'),
  onClose: () => console.log('Widget closed'),
  onSubmit: (ticketId) => console.log('Ticket created:', ticketId),
};
```

---

## Customization

### CSS Overrides

The widget uses shadow DOM for isolation. To customize appearance:

```css
/* Override floating button styles */
#support-widget-container button {
  background-color: #your-color !important;
}

/* Override modal styles */
#support-widget-container [role="dialog"] {
  border-radius: 8px !important;
}
```

### Positioning

The widget supports two positions:

- **bottom-right** (default): Appears in bottom-right corner
- **bottom-left**: Appears in bottom-left corner

For custom positioning, modify the embed script or use CSS overrides.

---

## Form Fields

The support form includes the following fields:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | Text | Yes | 2-100 characters |
| Email | Email | Yes | Valid email format |
| Subject | Text | Yes | 5-200 characters |
| Category | Select | Yes | general, technical, billing, feedback, bug_report |
| Priority | Select | No | low, medium (default), high |
| Message | Textarea | Yes | 10-1000 characters |
| Attachments | File Upload | No | Max 3 files, 5MB each |

---

## Accessibility

The widget is WCAG 2.1 AA compliant:

- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ ARIA labels for all interactive elements
- ✅ Focus indicators (2px outline)
- ✅ Screen reader support
- ✅ High contrast mode support

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate to next element |
| `Shift+Tab` | Navigate to previous element |
| `Enter` | Submit form / Activate button |
| `Escape` | Close modal |
| `Space` | Activate focused button |

---

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Opera | 76+ | ✅ Full |

---

## Troubleshooting

### Widget Not Appearing

1. Check that the script is loaded:
   ```javascript
   console.log(window.SupportWidget);
   ```

2. Verify the script URL is correct
3. Check browser console for errors
4. Ensure no CSP (Content Security Policy) blocks the script

### Form Submission Fails

1. Check network connectivity
2. Verify API URL is correct
3. Check browser console for API errors
4. Verify CORS is configured on backend

### Styling Issues

1. Check for CSS conflicts
2. Verify theme configuration
3. Use browser dev tools to inspect elements
4. Try CSS overrides with `!important`

---

## Security Considerations

### For Website Owners

1. **CORS Configuration**: Ensure your backend allows requests from your domain
2. **Rate Limiting**: Configure rate limiting to prevent abuse
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Backend validates all inputs (never trust client-side only)

### CSP Headers

Add these headers to allow the widget:

```
Content-Security-Policy: script-src 'self' 'unsafe-inline' https://your-domain.com
```

---

## Testing

### Local Testing

1. Start the development server:
   ```bash
   docker-compose up
   ```

2. Access the form at: http://localhost:3000

3. Test form submission at: http://localhost:8000/docs

### Production Testing

1. Deploy to production
2. Test on multiple browsers
3. Test on mobile devices
4. Verify accessibility with screen reader
5. Run Lighthouse audit

---

## Analytics (Optional)

Track widget usage with your analytics platform:

```javascript
window.SupportWidget = {
  onOpen: () => {
    gtag('event', 'support_widget_open', {
      event_category: 'support',
      event_label: 'Widget opened',
    });
  },
  onSubmit: (ticketId) => {
    gtag('event', 'support_form_submit', {
      event_category: 'support',
      event_label: 'Ticket: ' + ticketId,
    });
  },
};
```

---

## Support

For issues or questions:

- **Documentation**: https://docs.your-domain.com
- **API Status**: https://status.your-domain.com
- **Contact**: support@your-domain.com

---

**Next Steps**:
1. Copy embed script to your website
2. Configure data attributes
3. Test form submission
4. Monitor analytics
