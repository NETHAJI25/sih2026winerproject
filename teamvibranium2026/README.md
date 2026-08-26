# InnoIndia — Civic Issue Reporting & Resolution System

**Team Vibranium | SRM Institute of Science and Technology, Ramapuram | Smart India Hackathon (SIH) 2026**

> Report. Track. Resolve.

A crowdsourced civic issue reporting and resolution system that connects citizens directly with their municipal government.

## Live Demo

- **App:** https://innoveo-civic.vercel.app
- **Citizen portal:** https://innoveo-civic.vercel.app/civilian
- **Government portal:** https://innoveo-civic.vercel.app/government
- **Presentation deck:** https://innoveo-civic.vercel.app/presentation

### Demo logins
| Role | Email | Password |
|------|-------|----------|
| Citizen | `nethaji@srmist.edu.in` | `demo123` |
| Municipal Officer | `officer@srmist.edu.in` | `demo123` |

## Problem Statement
**SIH25031 — Crowdsourced Civic Issue Reporting and Resolution System** (Government of Jharkhand, Clean & Green Technology theme)

## Features
- **Citizen portal** — report issues with photo + GPS location, AI category suggestion, upvote issues, real-time status tracking with timeline
- **Government portal** — live analytics dashboard (status donut + category charts), issue workflow (Pending → In Progress → Resolved/Rejected), officer notes
- **100% offline-safe** — zero external dependencies, runs from `file://` or any static host
- **Offline data layer** — localStorage-based persistence with seeded demo data, image compression, AI-style auto-categorization heuristic

## Tech Stack
HTML5 · CSS3 · Vanilla JavaScript · LocalStorage · Vercel (hosting)

## Project Structure
```
civic-portal/
├── index.html        # Landing page
├── civilian.html     # Citizen portal
├── government.html   # Government officer portal
├── presentation.html # SIH-format presentation deck (12 slides)
├── styles.css        # Shared design system
└── data.js           # Offline data layer (localStorage + auth + reports)
```

## Run locally
Open `civic-portal/index.html` directly in a browser. No build step, no server required.

## Deployment
```bash
cd civic-portal
vercel --prod
```

---

*Team Vibranium — Smart India Hackathon 2026 Internal Hackathon*
