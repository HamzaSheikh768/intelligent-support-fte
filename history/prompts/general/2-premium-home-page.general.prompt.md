---
id: 2
title: Create Premium Home Page with Framer Motion
stage: general
date_iso: 2026-03-17
surface: agent
model: qwen-code
feature: none
branch: main
user: dell
command: npm run build
labels: ["frontend", "home-page", "framer-motion", "landing-page", "animations"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - src/app/page.tsx
  - src/components/ui/card.tsx
tests_yaml: |
  - npm run build
prompt_text: |
  You are a Senior Next.js + Framer Motion UI/UX Engineer specializing in high-converting SaaS landing pages.

  Using the exact theme, fonts, color palette, and Navbar component from the previous step, create the COMPLETE Home Page for the "CRM Digital FTE Factory" project.

  File: /app/page.tsx

  Requirements (strictly follow):

  Hero Section (full viewport height):

  - Background: Dark navy-blue to deep black gradient (#0A1428 → #000000) with subtle animated grid pattern and floating particles (Framer Motion).

  - Centered content:

    - Main Heading (super bold, 6xl/7xl on desktop): 
      "Meet Your 24/7 AI Customer Success Employee"

    - Sub-heading (large, elegant): 
      "The Digital FTE that works non-stop — handles Gmail, WhatsApp & Web inquiries, tracks tickets, escalates intelligently, and costs less than $1,000/year."

    - Professional paragraph (max 90 characters per line, centered):
      "Built for growing SaaS companies. Never sleeps. Never takes a day off. Delivers enterprise-grade customer success 24/7 across every channel while your human team focuses on high-value work."

    - Primary CTA Button: "Get Support Now" (large, glowing, scrolls smoothly to /support page)

    - Secondary CTA: "Watch 45-Second Demo" (outlined)

  Three Fully Animated Sections (use Framer Motion, scroll-triggered animations, stagger children, viewport once):

  1. "AI That Never Sleeps"

     - Counter animations (Framer Motion + useInView): 
       • 99.9% Uptime
       • 24/7 Availability
       • < $1,000 per year
       • 10× Faster Responses

     - Clean stats cards with shadcn/ui + hover lift effect

  2. "Multi-Channel Support — Built for Real Customers"

     - Three large animated cards with icons (WhatsApp green, Gmail blue, Web Form purple)

     - Each card shows real channel examples + smooth icon animation on hover

     - Subtext: "Seamless conversation continuity across all channels"

  3. "Instant Ticket Tracking & Smart Escalation"

     - Live demo animation: Fake ticket appearing → AI responding → status changing in real-time (Framer Motion timeline)

     - Show sentiment analysis, cross-channel history, and escalation badge

     - Use shadcn cards with subtle glow

  Professional Footer:

  - Logo + tagline

  - Quick links (Home, Support, Demo, Docs)

  - "Built for Panaversity Agent Factory Hackathon 5"

  - Copyright + social icons

  Tech Requirements:

  - Next.js 16 App Router + TypeScript

  - Tailwind + shadcn/ui components

  - Framer Motion for all animations (heavy use of variants, stagger, scroll animations)

  - Fully responsive (mobile-first)

  - Accessibility (ARIA labels, focus states)

  - Smooth scrolling

  - No placeholder text — everything must feel production-ready and premium

  Generate:

  1. Full code for app/page.tsx

  2. Any new components you create (create a components/ folder structure in the response)

  3. All necessary imports and Framer Motion setup

  Start your response with:

  "✅ PREMIUM HOME PAGE COMPLETE — Upgraded Hero + Professional Paragraph + Heavy Animations Generated"

  Then deliver clean, well-commented code with clear section comments.
response_text: |
  Created a complete premium home page with all requested features including animated hero section with gradient background, floating particles, animated grid, three fully animated sections (stats, multi-channel cards, ticket demo), and professional footer. Build verified successfully.
outcome: |
  Successfully implemented premium home page with:
  1. Hero section with navy-blue to black gradient, animated grid, floating particles, and floating orbs
  2. Stats section with 4 animated counter cards (99.9% uptime, 24/7, $1,000/year, 10× faster)
  3. Multi-channel section with 3 animated cards (WhatsApp, Gmail, Web Form)
  4. Ticket tracking section with live demo animation showing ticket lifecycle
  5. Professional footer with brand, links, and hackathon attribution
evaluation: |
  Build passed with no errors. All animations use Framer Motion with scroll-triggered variants, stagger children, and viewport-once rendering. Fully responsive and production-ready.
---

# Implementation Summary

## Components Created

### 1. Main Page (src/app/page.tsx)
Complete premium landing page with the following sections:

**Hero Section:**
- Full viewport height with #0A1428 → #000000 gradient
- Animated grid background with moving pattern
- 30 floating particles with random animations
- 2 floating gradient orbs with parallax scroll effect
- Staggered text animations for heading, subheading, and paragraph
- Two CTA buttons with hover scale effects
- Scroll indicator with bouncing animation

**Stats Section:**
- 4 animated stat cards with gradient icons
- Counter animation component for numeric values
- Hover lift effect on all cards
- Gradient backgrounds: yellow-orange, blue-cyan, green-emerald, purple-pink

**Multi-Channel Section:**
- 3 large channel cards (WhatsApp, Gmail, Web Form)
- Channel-specific gradient colors
- Icon rotation animation on hover
- Arrow link with translate animation
- Staggered entrance animations

**Ticket Tracking Section:**
- Split layout with features list and live demo
- Animated ticket component showing:
  - Customer message with avatar
  - AI response with timing
  - 4-step status timeline (New → Processing → Response → Resolved)
  - Sentiment analysis indicator
  - Auto-cycling through status steps every 2.5 seconds

**Footer:**
- Brand section with logo and description
- Quick links (Home, Support, Demo, Docs)
- Social media icons (GitHub, Twitter, LinkedIn)
- Hackathon attribution
- Copyright bar

### 2. Card Component (src/components/ui/card.tsx)
Complete shadcn/ui card component with:
- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Proper TypeScript types
- Tailwind class merging utility

## Animation Features Used

- **useScroll + useTransform**: Parallax effects on hero orbs
- **useInView**: Scroll-triggered animations with viewport detection
- **useSpring**: (available for future use)
- **Variants**: Reusable animation definitions (fadeInUp, fadeIn, staggerContainer, scaleIn, slideInLeft, slideInRight)
- **Counter Animation**: Custom requestAnimationFrame-based counting
- **Auto-cycling State**: Ticket demo with setInterval
- **Hover Animations**: Scale, rotate, translate, lift effects
- **Stagger Children**: Parent container variants with staggerChildren

## Files Modified/Created
- `src/app/page.tsx` - Complete home page (900+ lines)
- `src/components/ui/card.tsx` - Card component
- `src/app/globals.css` - Already had dark theme from previous step
- `src/app/layout.tsx` - Already configured with fonts and theme provider

## Build Verification
Build completed successfully with no errors. Page is statically generated and production-ready.
