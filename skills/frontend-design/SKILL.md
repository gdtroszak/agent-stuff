---
name: frontend-design
description: "Design and implement distinctive, production-ready frontend interfaces with strong aesthetic direction. Use when asked to create or restyle web pages, components, or applications (HTML/CSS/JS, React, Vue, etc.)."
---

# Frontend Design Skill

Design and implement memorable frontend interfaces with a clear, intentional aesthetic. Every visual choice should be rooted in purpose and context.

## Process

Before coding, identify purpose, audience, brand/voice, and technical constraints. If the user didn't provide these, ask **2–4 targeted questions** or state reasonable assumptions.

## Design Thinking (Required)

Commit to a **single, bold aesthetic direction**. Name it and execute it consistently. Examples:
- Brutalist / raw / utilitarian
- Editorial / magazine / typographic
- Luxury / refined / minimal
- Retro-futuristic / cyber / neon
- Art-deco / geometric / ornamental
- Handcrafted / organic / textured

Before writing code, define:
1. **Visual direction** — one sentence that describes the vibe
2. **Differentiator** — what should be memorable about this UI?
3. **Typography system** — display + body fonts, scale, weight, casing
4. **Color system** — dominant, accent, neutral; define as CSS variables
5. **Layout strategy** — grid rhythm, spacing scale, hierarchy plan
6. **Motion strategy** — 1–2 meaningful interaction moments

If the user wants code only, skip the explanation but still follow this internally.

## Aesthetic Guidelines

- Typography defines the voice — use a distinct display font + refined body font; avoid defaults (Inter, Roboto, Arial)
- Commit to a palette with a strong point-of-view; check contrast and legibility
- Encourage asymmetry, scale contrast, overlap, or grid breaks
- Use negative space deliberately (or controlled density if maximalist)
- Add texture or depth when appropriate (noise, grain, subtle patterns)
- Use motion sparingly but meaningfully; honor `prefers-reduced-motion`
- Shadows, glows, borders, masks, clip-paths — only when they serve the concept

## Avoid

- Cookie-cutter hero + 3 card layouts
- Generic gradients and default font choices
- Unmotivated decorative elements
- Overly flat, characterless component libraries
- **Generic AI aesthetics** — no "default" fonts, color schemes, or stock layouts

## Quality Checklist

- [ ] Working code — runs as-is, HTML/CSS/JS or framework code
- [ ] Semantic & accessible — headings, labels, focus states, keyboard nav
- [ ] Responsive — fluid layouts, breakpoints, responsive typography
- [ ] Tokenized — CSS variables for colors, spacing, radii, shadows
- [ ] Aesthetic direction is unmistakable
- [ ] Typography feels intentional and expressive
- [ ] Layout and spacing are consistent and purposeful
- [ ] Color palette is cohesive and legible
- [ ] Customization is easy via CSS variables or config objects

**Choose a direction and execute it relentlessly.**
