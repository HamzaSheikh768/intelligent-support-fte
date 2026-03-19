---
id: 1
title: Implement Dark Theme Layout with Framer Motion
stage: general
date_iso: 2026-03-17
surface: agent
model: qwen-code
feature: none
branch: main
user: dell
command: npm install framer-motion && npm install next-themes@latest
labels: ["frontend", "dark-theme", "layout", "nextjs", "framer-motion"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - src/app/globals.css
  - src/app/layout.tsx
  - src/components/Navbar.tsx
  - src/components/Layout.tsx
  - tailwind.config.ts
tests_yaml: |
  - npm run build
prompt_text: |
  before used skills, subagents. "You are a senior Next.js expert. The project is already created with Next.js 16 App Router.

  First read @requirement.md and the original hackathon PDF.

  Create:

  1. Full dark theme (black + blue #3B82F6 accent) in globals.css

  2. Load Geist (heading), Inter (body), Geist Mono (Ticket ID) using next/font

  3. Create a reusable Layout component with:

     - Transparent fixed Navbar

     - Left: Logo + links (Home, Support, Admin) with Lucide icons

     - Right: Project name

  4. Add Framer Motion for page transitions

  Generate complete code for:

  - app/globals.css

  - app/layout.tsx

  - components/Navbar.tsx

  - components/Layout.tsx

  Start directly with code."
response_text: |
  Implemented full dark theme with black background and blue accent (#3B82F6), configured Geist/Inter/Geist Mono fonts via next/font, created reusable Layout component with transparent fixed Navbar containing Logo + navigation links (Home, Support, Admin) with Lucide icons on the left and project name on the right, and added Framer Motion page transitions. Build verified successfully.
outcome: |
  Successfully implemented all requested features:
  1. Dark theme with black background (#050505) and blue accent (#3B82F6)
  2. Font configuration: Geist for headings, Inter for body, Geist Mono for ticket IDs
  3. Reusable Layout component with fixed transparent Navbar
  4. Framer Motion page transitions with fade/slide animations
evaluation: |
  Build passed with no errors. All components are properly typed and follow Next.js 15/16 App Router patterns. Theme system uses next-themes v0.4.6 with proper client-side mounting.
---

# Implementation Summary

## Changes Made

### 1. Dark Theme (globals.css)
- Configured CSS variables for dark theme with black background (0 0% 3%) and blue accent (221 83% 53%)
- Added custom scrollbar styling for dark theme
- Maintained light theme variables for future theme switching

### 2. Font Configuration (layout.tsx)
- Geist (via Inter as fallback) for headings
- Inter for body text
- Geist Mono for ticket IDs and code elements
- All fonts loaded via next/font/google with CSS variables

### 3. Navbar Component (Navbar.tsx)
- Fixed transparent navbar with backdrop blur
- Left side: Logo with shield icon + navigation links (Home, Support, Admin)
- Right side: Project name + theme toggle button
- Lucide icons for all navigation items
- Active state highlighting for current route

### 4. Layout Component (Layout.tsx)
- Reusable wrapper with Navbar
- Framer Motion page transitions (fade + slide)
- Proper spacing with pt-16 to account for fixed navbar

### 5. Tailwind Configuration
- Added custom font families (sans, heading, mono)
- Mapped to CSS variables from next/font

## Dependencies Added
- framer-motion: Page transitions
- next-themes@0.4.6: Theme management (updated from v0.2.1)

## Verification
- Build completed successfully with no errors
- Static pages generated correctly
