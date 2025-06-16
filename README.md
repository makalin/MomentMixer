# 📸 MomentMixer

**MomentMixer** is a lightweight web app that **instantly blends real-time camera inputs from multiple nearby mobile devices** into a shared, dynamic photo or video collage. Perfect for events, parties, performances, or spontaneous group creativity — no app install required.

## 🌟 Features

### Core Features
* 🔴 **Real-Time Camera Sync** – Instantly stream from multiple devices via WebRTC
* 🧠 **Live Collage Generator** – Merge inputs into one evolving artistic layout
* 📱 **No App, No Bloat** – Just scan and shoot — mobile-first, browser-native
* 🕺 **Built for Gatherings** – Great for weddings, concerts, pop-ups, meetups

### Visual Features
* 🎨 **Real-Time Filters** – Apply creative effects on-the-fly:
  - Grayscale
  - Sepia
  - Invert
  - Blur
  - Vintage
* 🎯 **Multiple Layouts**:
  - Grid (auto-arranged)
  - Mosaic (main + preview)
  - Dynamic (content-aware)
  - Focus (highlight specific participants)
* 🌓 **Dark/Light Theme** – Choose your preferred viewing mode

### Control Features
* 🎥 **Camera Controls**:
  - Switch between available cameras
  - Mute/unmute audio
  - Fullscreen mode
* 📸 **Capture Options**:
  - Screenshot capture
  - Video recording
  - Share session link
* 🔊 **Audio Management**:
  - Individual mute controls
  - Global mute/unmute (host)
  - Audio track replacement

## 🎯 Use Cases

| 📍 Scenario    | 🤳 What It Does                                                  |
| -------------- | ---------------------------------------------------------------- |
| Wedding        | Capture simultaneous candid moments from friends & family        |
| Street Art     | Blend crowd views and performer angles into a single composition |
| House Party    | Guests stream reactions, moments, and chaos live                 |
| Flashmob Event | Multi-perspective real-time group recording                      |
| Live Event     | Multiple camera angles for dynamic event coverage                |
| Group Photo    | Create unique group photos with everyone's perspective           |

## ⚙️ Technology Stack

* **Vanilla JS + HTMX** – Lightweight DOM logic
* **WebRTC** – Peer-to-peer video streaming
* **Canvas / WebGL** – Real-time video blending
* **Socket.IO** – Session signaling & peer discovery
* **MediaRecorder API** – Local recording
* **Web Share API** – Session sharing
* **MediaDevices API** – Camera management

No React. No SPA overhead. Built to be fast, hackable, and device-friendly.

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* Modern browser with camera support
* HTTPS for production (required for camera access)

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
* Filters and effects are applied in real-time
* Recordings or snapshots can be saved locally

## 🎨 Features in Detail

### Layouts
* **Grid**: Automatically arranges videos in a responsive grid
* **Mosaic**: Main video with side previews for better focus
* **Dynamic**: Content-aware arrangement based on video activity
* **Focus**: Highlight specific participants in full screen

### Filters
* **Grayscale**: Classic black and white effect
* **Sepia**: Warm vintage tone
* **Invert**: Color inversion for artistic effect
* **Blur**: Soft focus effect
* **Vintage**: Combined sepia and contrast adjustment

### Controls
* **Camera**: Switch between available cameras
* **Audio**: Individual and global mute controls
* **Layout**: Change arrangement on the fly
* **Capture**: Screenshot and video recording
* **Share**: Easy session sharing via QR or link

## 🛡️ Privacy First

* No cloud storage
* Peer-to-peer streams
* Nothing saved unless manually recorded
* Local processing only
* No data collection

## 💡 Future Ideas

* [ ] Livestream output to social platforms
* [ ] AI-guided frame cropping
* [ ] Motion detection for dynamic layouts
* [ ] Custom filter creation
* [ ] Offline mode for small groups
* [ ] Collaborative drawing overlay
* [ ] Audio visualization effects
* [ ] Background removal/blur

## 🙌 Contribute

Pull requests welcome! Let's build the ultimate collaborative memory machine.

### Development

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT — use, remix, and make moments better.

## 🤝 Support

* Report bugs via GitHub Issues
* Feature requests welcome
* Documentation improvements appreciated
