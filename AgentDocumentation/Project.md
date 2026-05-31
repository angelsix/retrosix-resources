# retrosix-resources

An open-source collection of RetroSix hardware resources, PCB designs, KiCad libraries, SVG assets, and documentation — all released under the MIT License. Includes the RetroSix KiCad symbol library, PCB views and scans for Game Boy Advance, Game Gear, and other retro consoles, a standalone PCB viewer for the PC Engine GT, and an open GBA Cartridge RePCB (AGB-E05-01) recreation.

## Agent files for this project

- Global profile: `/Users/lukemalpass/Documents/GitHub/ai-mecca/AgentDocumentationGlobal/Global.md`
- This project's `AgentDocumentation/` folder (`Project.md`, `Memory.md`, `Glossary.md`)
- Session-start read order: this file, `Memory.md`, `Glossary.md`, then the specific sub-folder README

## Rules

Inherits all global rules from `AgentDocumentationGlobal/Global.md`. Project-specific rules:
- **MIT License**: all content is freely usable, modifiable, and distributable. No attribution required. See `LICENSE` for full terms.
- **Each sub-folder is an independent resource**: `KiCad/` (symbol library), `PC Engine GT/` (PCB viewer tool), `Game Boy Advance/`, `Game Gear/`, `SNES/`, etc. — treat as separate mini-projects
- **KiCad files** (`.kicad_sym`, `.kicad_pcb`, `.kicad_mod`) are human-readable text but large and noisy — read references only, never diff
- **PCB viewer** (`PC Engine GT/PCE PCB Viewer/`) is a standalone Node.js/Express site with pan/zoom capability, serving JPG board scans (Top/Bottom copper, Top/Bottom photos)
- **`.claude/`** and `__pycache__/` may exist — ignore these

## Build / launch / deploy

- **PC Engine GT PCB Viewer**: `node server.js` (or `run.bat` on Windows), serves at `http://127.0.0.1:8080` by default. Express server with strict CSP headers.
- **KiCad library**: import via KiCad Preferences → Manage Symbol Libraries → add `RetroSix Library.kicad_sym`
- **No unified build or test** — resources are static files

## Architecture

- **`LICENSE`** — MIT License (c) 2021 Luke Malpass
- **`KiCad/`** — RetroSix KiCad symbol library (`.kicad_sym`, legacy `.bak`)
- **`PC Engine GT/PCE PCB Viewer/`** — standalone Node.js PCB board viewer:
  - Express server serving board scan images (Top/Bottom copper, Top/Bottom photos)
  - Pan/zoom via `panzoom.js` (vanilla JS library)
  - Strict CSP: no external scripts/styles, self-only source
  - Python helper: `Scripts/run.py`
- **`GBA Cartridge RePCB (AGB-E05-01)/`** — open-source GBA cartridge PCB recreation with accurate traces, copper pours, silkscreen, and board edge
  - `Resources/` — SVG polygon files for PCB design
- **`Game Boy Advance/`** — GBA-related resources (Board Scans, GBA CleanLight)
- **`Game Gear/`** — Game Gear-related resources (Board Scans)
- **`Game Boy/`**, **`Game Boy Color/`**, **`Game Boy Advance SP/`**, **`SNES/`** — console-specific resource folders
- **`Game Development/`** — game development resources

## Priming notes

This repo is a resource collection, not a codebase to modify. Each sub-folder typically has its own README explaining its purpose. KiCad files are legible text but best treated as opaque design data. The only runnable code is the PC Engine GT PCB viewer (Node.js/Express).
