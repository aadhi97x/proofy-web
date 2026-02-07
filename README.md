# PROOFY.AI // Neural Forensic Suite

**PROOFY.AI** is a high-fidelity, world-class truth verification platform designed for a synthetic age. It leverages the latest advancements in Large Multimodal Models (LMMs) to interrogate media, detect deepfakes, verify facts, and generate auditable forensic documentation.

---

## 🛡️ Core Features

### 1. Neural Forensic Media Analysis
- **Multimodal Interrogation**: Deep-scan of images and video for GAN artifacts, frequency domain anomalies, and pixel-level inconsistencies.
- **Biometric Audit**: Evaluates facial symmetry, subsurface scattering (light bounce on skin), and micro-expressions.
- **Temporal Flow Analysis**: For video, the suite scans frame cohesion to detect flickering or motion vector drifts typical of frame-swap deepfakes.
- **Powered by**: `gemini-3-pro-preview` with high thinking budgets for exhaustive reasoning.

### 2. Text Lab & Fact Verification
- **AI Text Detection**: Identifies linguistic markers and "synthetic fingerprints" in written content.
- **Search-Grounded Fact Checking**: Cross-references claims against real-time global data using Google Search grounding.
- **Powered by**: `gemini-3-flash-preview` for speed and `gemini-3-pro-preview` for complex truth-claims.

### 3. Source Finder (Reverse Grounding)
- **Origin Discovery**: Upload media to locate its first appearance on the web.
- **Integrity Check**: Compares current media against discovered originals to highlight unauthorized modifications.
- **Powered by**: `googleSearch` tool integration.

### 4. Batch Triage
- **Parallel Processing**: Ingest and analyze multiple files simultaneously.
- **Data Export**: Generate batch CSV reports or individual `.txt` forensic logs for large-scale investigations.

## 🌪️ Advanced UI/UX

- **Neural Forensic Aesthetic**: A charcoal-dark interface with neon-green (`#00FF88`) accents, tactical HUD elements, and bento-box layouts.
- **Cinematic Animations**: Powered by `Framer Motion`, featuring data-particle fields, periodic laser-scan sweeps, and glitch-reveal typography.
- **System Destabilization (Anti-Gravity)**: An interactive "easter egg" physics mode that deconstructs the UI into draggable, buoyant physical objects using a custom 2D physics engine.
- **Responsive Design**: Fully optimized for tactical desktop workstations and mobile forensic units.

---

## ⚙️ Technical Architecture

### Model Routing
| Task | Model Alias | Key Config |
| :--- | :--- | :--- |
| Forensic Interrogation | `gemini-3-pro-preview` | `thinkingBudget: 16000` |
| Fast Text Scans | `gemini-3-flash-preview` | `responseMimeType: "application/json"` |
| Image Synthesis | `gemini-2.5-flash-image` | `aspectRatio` |
| Video Synthesis | `veo-3.1-fast-generate-preview` | `resolution: "720p"` |
| Search Grounding | `gemini-3-pro-preview` | `tools: [{ googleSearch: {} }]` |

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS.
- **Animations**: Framer Motion.
- **Icons**: Lucide-React.
- **Intelligence**: Google Gemini API (@google/genai).

---

## 🔑 Security & Privacy
- **AES-256 Tunneling**: Conceptual encrypted intake for sensitive forensic data.
- **Local Triage**: History is stored in local browser state (`localStorage`), ensuring data never stays on a central server beyond the session duration.
- **Forensic Guard**: Toggleable privacy mode to mask sensitive metadata during demonstrations.

---
*Developed by Senior Neural Forensic Engineers.*
