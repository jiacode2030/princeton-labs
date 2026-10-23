# Princeton Labs

Interactive study sites that follow Princeton courses, week by week. This repo is the landing page at https://jiacode2030.github.io/princeton-labs/, which links to each course site:

- [PHY 103 Lab](https://jiacode2030.github.io/phy103-lab/), built from the same source as AP Labs' Mechanics Lab (see [physics-mechanics](https://github.com/jiacode2030/physics-mechanics))
- [Multivariable Calculus Lab](https://jiacode2030.github.io/multivariable-calculus/) (MAT 201)

> Unofficial study aids. Not affiliated with Princeton University. Use them to study, not on graded work, and follow each course's collaboration rules.

It's plain static files with no build step:

- `index.html` is the whole page.
- `courses.js` is the course list.
- `privacy.html` and `terms.html` hold the privacy policy and terms of use for every Princeton Labs site, styled by `legal.css`. Each course site links to them at `/princeton-labs/privacy.html` and `/princeton-labs/terms.html`.
- `tests/check.js` holds the Playwright checks.

There are no analytics on any Princeton Labs site, and no shared feedback repo. Each course site's Report link opens an issue in that site's own repo.

## Add a course

Add one entry to `courses.js` (the fields are described at the top of the file). Progress can be a JSON object `{id: 1}` (PHY 103 stores `phy-done`) or a JSON list of ids (MAT 201 stores `mvc-visited`); set `progressWord` to `done` or `visited` and `unitWord` to `modules` or `lessons` so the ring reads right. The landing page reads these keys and never writes them.

Every course site should have the More labs link (to `/princeton-labs/`), the credit and © line, Last updated, and the privacy and terms links.

## Deploy

Push to `main`. GitHub Pages serves this repo from the root (Settings → Pages → Deploy from a branch → `main` / root).

## Checks

```
node tests/check.js
```

The script opens the page at 360, 768 and 1280 px in light and dark. It checks for overflow, bad text, console errors, touch targets, contrast and heading order, and checks both progress rings with fake data. It also confirms there's no analytics or report link, and that the privacy and terms pages load cleanly.

© 2026 JL. All rights reserved.
