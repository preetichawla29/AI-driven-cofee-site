---
name: cafe-section
description: Build a page section for the Brew & Bloom cafe site. Use when asked to add or create a section (hero, menu, about, gallery, contact, footer).
---

# Cafe section rules

1. One folder per section: `src/components/<Name>/` with `<Name>.jsx`, `<Name>.module.css`, `index.js`.
2. Colors, fonts and spacing come only from CSS variables in `src/styles/tokens.css`. No hard-coded values.
3. Mobile-first CSS; add `@media (min-width: 768px)` for larger screens.
4. Each section is a `<section id="...">` matching the navbar anchors (#home, #menu, #about, #gallery, #contact), with a heading.
5. Images need meaningful `alt` text. Use `loading="lazy"` below the fold.
6. Semantic HTML, visible focus states, no libraries without asking.
7. Add the section to `src/App.jsx` in page order.