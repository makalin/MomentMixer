# 📸 MomentMixer

**MomentMixer** is a lightweight web app that **instantly blends real-time camera inputs from multiple nearby mobile devices** into a shared, dynamic photo or video collage. Perfect for events, parties, performances, or spontaneous group creativity — no app install required.

## 🌟 Features

* 🔴 **Real-Time Camera Sync** – Instantly stream from multiple devices via WebRTC
* 🧠 **Live Collage Generator** – Merge inputs into one evolving artistic layout
* 🎨 **Visual FX & Filters** – Apply creative effects on-the-fly (glitch, noir, retro)
* 📱 **No App, No Bloat** – Just scan and shoot — mobile-first, browser-native
* 🕺 **Built for Gatherings** – Great for weddings, concerts, pop-ups, meetups

## 🎯 Use Cases

| 📍 Scenario    | 🤳 What It Does                                                  |
| -------------- | ---------------------------------------------------------------- |
| Wedding        | Capture simultaneous candid moments from friends & family        |
| Street Art     | Blend crowd views and performer angles into a single composition |
| House Party    | Guests stream reactions, moments, and chaos live                 |
| Flashmob Event | Multi-perspective real-time group recording                      |

## ⚙️ Technology Stack

* **Vanilla JS + HTMX** – Lightweight DOM logic
* **WebRTC** – Peer-to-peer video streaming
* **Canvas / WebGL** – Real-time video blending
* **Socket.IO or WebSockets** – Session signaling & peer discovery
* **FFmpeg.js (optional)** – Local recording

No React. No SPA overhead. Built to be fast, hackable, and device-friendly.

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* Modern browser with camera support

### Setup

```bash
git clone https://github.com/makalin/MomentMixer.git
cd MomentMixer
npm install
npm start
```

Visit `http://localhost:3000` to launch the host interface.

### Mobile Join Flow

1. Host starts a session and displays a QR code
2. Guests scan the code to join via their browser
3. Camera feed is streamed and auto-composed in real time

## 📸 How It Works

* Session host acts as peer connector and canvas renderer
* Guest devices stream video to host via WebRTC
* Video feeds are arranged and composited into a live collage
* Optionally, recordings or snapshots can be saved locally

## 📷 Preview

![Live collage from 4 cameras](assets/demo-preview.jpg)

## 🛡️ Privacy First

* No cloud storage
* Peer-to-peer streams
* Nothing saved unless manually recorded

## 💡 Future Ideas

* [ ] Livestream output to social platforms
* [ ] Dynamic layout switching (grid, mosaic, split-screen)
* [ ] AI-guided frame cropping or effect suggestion
* [ ] Offline mode for small groups

## 🙌 Contribute

Pull requests welcome! Let’s build the ultimate collaborative memory machine.

## 📄 License

MIT — use, remix, and make moments better.
