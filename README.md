# Project Wayne — redesign prototype

A restyle of [projectwayne.com](https://projectwayne.com/) built from `Project Wayne analisi e restyling.md`.
Everything on the site is taken from the real pages and public spreadsheets; nothing is invented
(project progress bars only appear where the original gives a number).

**Concept:** the site is a building. Scrolling the home page is a descent from the tower (light, serif, brass)
to the cave (dark, condensed type, signal yellow). Every floor is also its own page.

## Run

```bash
cd site
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in site/dist
```

## Moving around without scrolling

| How | What |
| --- | --- |
| Top bar, two wings | **Bruce Wayne**: Boardroom, Applied Sciences, Wayne Manor. **Batman**: Evidence Room, The Cave |
| Elevator panel (right edge, bottom bar on mobile) | Doors close, floor numbers count, doors open on the new page |
| `M` or the Map button | Cutaway of the whole property (tower, manor, evidence room, cave). Hover or arrow-key to a space: the route from where you are lights up (elevator, the drive, the clock passage, the tunnel) with a travel time; `↵` rides there |
| `1`–`6` | Same as the elevator, from the keyboard |
| `⌘K` / `Ctrl K` / `/` | WAYNE/OS: search every space, room, milestone, case, project and guide |

## Spaces (inspired by the films from 2005 on)

| Code | Space | Page | Wing | Nods to |
| --- | --- | --- | --- | --- |
| L42 | Penthouse | `/` | Bruce | Batman Begins, The Dark Knight |
| L30 | Boardroom | `/record` | Bruce | Batman Begins, The Dark Knight |
| L12 | Applied Sciences | `/blueprint` | Bruce | Batman Begins, The Dark Knight |
| G | Wayne Manor | `/archive` | Bruce | Batman Begins, The Dark Knight Rises |
| B1 | Evidence Room | `/cases` | Batman | The Batman |
| B3 | The Cave | `/cave` (Training Floor, The Track, Workshop, Command Console) | Batman | Batman Begins, The Dark Knight Rises |

## Stack

Astro 5, GSAP (ScrollTrigger, SplitText), Lenis, OGL (hero beam shader), three.js (background figure, lazy-loaded). No UI framework.
Content lives in `site/src/data/wayne.ts`.

## Notes

- `prefers-reduced-motion` turns off smooth scroll, the shader loop, doors, reveals and the torch.
- No DC symbols or artwork are used; the emblem is an original clock face.
- The 3D figure (`site/src/scripts/suit-scene.ts`) is built from primitives: an original armored silhouette (lathe-turned V-taper torso, segmented pauldrons, cowl with brow and glowing slits, gauntlet fins, pleated cape that whips when you scroll fast) with no chest emblem. It only loads on screens wider than 760px, with motion allowed. To use a licensed model, replace `buildFigure`.
- The newsletter form is a prototype and sends nothing.
- Live data is a snapshot (running log through Aug 2026). Wiring it to the Google Sheet is the next step.
