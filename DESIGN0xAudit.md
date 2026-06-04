---
name: 0xAudit Cyber-Terminal
colors:
  surface: '#000000'
  on-surface: '#00FF41'
  primary: '#00FF41'
  on-primary: '#000000'
  secondary: '#1A1A1A'
  on-secondary: '#00FF41'
  error: '#FF0000'
  outline: '#00FF41'
  surface-variant: '#0C160A'
typography:
  font-family: 'JetBrains Mono', monospace
  headings:
    weight: 700
    style: uppercase
  labels:
    weight: 500
    style: uppercase
    case: terminal-caps
shape:
  roundness: 0px (Sharp/Terminal)
  border-width: 1px
effects:
  scanlines: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))"
  glow: "0 0 10px rgba(0, 255, 65, 0.4)"
  glitch: "aggressive clip-path slicing and chromatic aberration"
  typewriter: "character-by-character sequential reveal"
audio:
  engine: "Web Audio API"
  sounds: "mechanical-click (low-freq noise), data-beep (high-pitched square wave)"
---

# 0xAudit Cyber-Terminal Design System

## Core Aesthetic
A high-fidelity "Cyber-Terminal" interface inspired by modern Linux environments and classic Matrix aesthetics. The system prioritizes high-contrast phosphor green on pure black, monospace typography, and aggressive motion effects that simulate a state-of-the-art security console.

## Typography (JetBrains Mono)
- **Title/Hero**: 24pt+, Bold, Uppercase, Typewriter Effect.
- **Labels**: 10pt, Medium, Terminal Caps (e.g., `EXECUTE_AUDIT`).
- **Body**: 14pt, Regular, Monospace.
- **Code**: 12pt, Syntax Highlighted (Matrix Palette).

## Surface Logic (Terminal Cards)
- **Background**: Pure Black (#000000).
- **Borders**: 1px Solid Green (#00FF41).
- **Texture**: Vertical moving scanline overlay.
- **Interactions**: Glassmorphism blurs (10px) on modal overlays.

## Motion & Interactivity
1. **Aggressive Glitch**: CTA buttons use CSS `clip-path` and `transform` to "shred" visually on hover or periodic intervals.
2. **Boot Sequences**: Data panels must load sequentially (e.g., Status -> Stats -> Feed).
3. **Audio Cues**: 
   - `mechanical-click`: Triggered on button press.
   - `data-beep`: Triggered on navigation or critical alerts.

## Component Specifications
- **Primary Button**: Solid Green background, Black text, aggressive glitch animation.
- **Secondary Button**: Black background, Green border, subtle glow.
- **Status Pills**: `[READY]` or `[ERROR]` bracketed text indicators.
- **HUD Elements**: Progress bars styled as "Compute Load" with segmented blocks.