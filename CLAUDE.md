# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Big Pic Solutions** is a static marketing website for an AI-powered technology consulting business that helps reduce IT costs. The site emphasizes combining 25+ years of human expertise with AI capabilities to optimize technology spending.

**Tech Stack**: Pure vanilla HTML5, CSS3, and JavaScript (no frameworks, no build process required).

**Deployment**: GitHub Pages (custom domain: bigpicsolutions.com) with FormSubmit.co for serverless contact form handling.

## Key Architecture Decisions

### Monolithic HTML Structure
- **Single file**: All HTML, CSS, and JavaScript live in `index.html` (1,549 lines)
- **Rationale**: Minimizes HTTP requests, simplifies GitHub Pages hosting, and matches the site's simplicity
- **Also includes**: `thanks.html` for post-submission redirect

### Design System
- **CSS Variables** for theming (defined in `:root`)
  - `--primary: #00d4ff` (cyan)
  - `--secondary: #ff00ff` (magenta)
  - `--accent: #00ff88` (neon green)
  - `--dark: #0a0a0a` (background)
  - `--light: #ffffff` (text)
- **Mobile-first approach** with 768px breakpoint
- **Responsive Grid/Flexbox** layout with no preprocessor needed

### Visual Effects
- **Canvas API** for neural network particle animation
  - 50 particles max, 150px connection distance
  - Animated on scroll and automatically disabled on low-performance devices
  - Uses requestAnimationFrame for smooth performance
- **CSS animations** for fade-ins and transitions
- **Intersection Observer API** for scroll-triggered animations (10% visibility threshold)

### Form Handling
- **FormSubmit.co** integration (no backend required)
- Contact form submits to email, redirects to `thanks.html`
- Email address is in `index.html` form action attribute
- Spam protection via honeypot method

### Launch Countdown
- **Auto-updating countdown** to December 1, 2025
- Positioned at top of page above navigation
- Automatically hides after launch date
- Includes JavaScript timer that updates every minute

## Navigation & Content Structure

**Primary Sections** (anchor links):
- `#home` - Hero section with launch countdown
- `#about` - Company expertise and Apple Certification
- `#services` - 9 service offerings in 3x3 grid
- `#wins` - Client success stories (3 cards)
- `#contact` - Contact form

**Current Message Hierarchy**:
1. **Primary**: Stop overpaying for IT (cost optimization focus)
2. **Supporting**: 25 years experience + AI analysis
3. **Tertiary**: Apple certification, specific services

## Important Existing Documentation

- **[README.md](README.md)**: Project overview, features, customization guide
- **[docs/GITHUB_PAGES_SETUP.md](docs/GITHUB_PAGES_SETUP.md)**: Deployment instructions, form configuration
- **[docs/PROJECT_TRACKER.md](docs/PROJECT_TRACKER.md)**: Complete development history and recent changes
- **[docs/IMPROVEMENT_ACTION_PLAN.md](docs/IMPROVEMENT_ACTION_PLAN.md)**: Strategic improvements (Phases 1-3 complete, Phase 4 pending)

**Recent Major Updates** (see PROJECT_TRACKER.md for details):
- Message hierarchy optimization (hero → about → services flow)
- Content streamlining (~40% reduction eliminating redundancies)
- Launch countdown banner implementation
- Mobile hamburger menu implementation
- 9 service cards layout (3x3 grid)

## Development Notes

### No Build Process Required
- Simply edit `index.html` and test by opening in browser
- Changes are immediately visible - no compilation needed
- CSS and JavaScript are inline, no external dependencies to manage

### Testing Changes Locally
1. Edit `index.html`
2. Open in web browser (or use `open-website.bat` batch file)
3. Test responsive design by resizing window or using browser dev tools (toggle device toolbar)

### Common Tasks

**Update colors**: Modify CSS variables in the `:root` selector in `<style>` section
**Add services**: Duplicate a `.service-card` div in the Services section
**Modify content**: Edit text directly in relevant section divs
**Adjust animations**: Modify CSS `@keyframes` or Canvas particle parameters
**Test responsiveness**: Use browser dev tools (F12 → toggle device toolbar)

### Mobile Navigation
- Hamburger menu implemented for screens under 768px width
- Toggle controlled by JavaScript click handler on mobile-toggle element
- Menu items anchor-link to page sections with smooth scroll

### Performance Considerations
- Canvas animation optimized to 50 particles maximum
- Intersection Observer prevents off-screen animations
- GPU-accelerated transforms used for animations
- Minimal external requests (only FormSubmit service)

## Future Development (Phase 4 - Performance & Polish)

**Pending from IMPROVEMENT_ACTION_PLAN.md**:
- Reduced motion detection (prefers-reduced-motion media query)
- Performance optimization for low-end devices
- SEO improvements (meta tags, structured data, analytics)
- Consider future features: ROI calculator, chatbot, blog section

## Git & Deployment

- **Repository**: Already set up at C:\Users\Iccanui\Documents\Projects\BigPicSolutions
- **Branch**: `main` (deploy directly from root)
- **Deployment**: Push to GitHub, GitHub Pages serves automatically
- **Custom domain**: CNAME file configured for bigpicsolutions.com

## Contact Form Configuration

The contact form currently sends to the email address in the form's `action` attribute (index.html). To change:
1. Find `<form action="https://formsubmit.co/...">`
2. Replace email in the action URL
3. Test by submitting the form once to activate with FormSubmit

## Code References

- **Canvas animation**: Search for `function initParticles()` in index.html
- **Countdown timer**: Search for `function updateCountdown()` in index.html
- **Scroll animations**: Search for `new IntersectionObserver` in index.html
- **Mobile menu toggle**: Search for `mobile-toggle` class in index.html
