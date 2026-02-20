# 🌿 Lumino — Your Consistency Curve

> *Not streaks. Just motion.*

A minimal, emotionally motivating habit tracker built with React Native (Expo). Inspired by physical notebook habit tracking. Dark, calm, distraction-free — with cloud sync via MongoDB Atlas.

---

## ✨ App Name Options

We recommend: **Lumino** — from *luminous*, suggesting clarity, calm progress, and light in consistency.

Other strong options:
- **Curvate** — the shape of your effort
- **Morva** — soft, natural, habitual
- **Tally** — simple and honest
- **Flowo** — flow state, daily motion

### Where to change the app name
```
| File | What to change |
|------|---------------|
| `app.json` | `"name": "Lumino"` and `"slug": "lumino"` |
| `app.json` | `ios.bundleIdentifier` → `com.yourname.lumino` |
| `app.json` | `android.package` → `com.yourname.lumino` |
| `app/index.tsx` | The `HABIT TRACKER` badge text |
| `app/dashboard.tsx` | The `habits` italic header text |
```
---

## 📁 File Structure

```
lumino/
├── app/
│   ├── _layout.tsx          # Root layout — SafeAreaProvider + Stack navigator
│   ├── index.tsx            # Landing screen (motivational)
│   └── dashboard.tsx        # Main habit tracker screen
│
├── components/
│   ├── MonthPicker.tsx      # Animated bottom sheet month/year selector
│   ├── HabitGrid.tsx        # Day × Habit grid with toggle cells
│   └── Graph.tsx            # SVG consistency curve with Y/X axis
│
├── utils/
│   ├── storage.ts           # AsyncStorage helpers + full data model
│   └── mongo.ts             # MongoDB Atlas Data API sync (no backend)
│
├── app.json                 # Expo config
├── package.json
├── tsconfig.json
├── babel.config.js
└── README.md
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install
npx expo install react-native-svg @react-native-async-storage/async-storage react-native-safe-area-context

# 2. Start the app
npx expo start

# 3. Scan QR code with Expo Go app on your phone
#    OR press 'i' for iOS simulator / 'a' for Android emulator
```

---

## 🍃 Features
```
| Feature | Description |
|---------|-------------|
| ✅ Daily habit grid | Notebook-style day × habit matrix with tap-to-toggle |
| 📈 Consistency curve | Smooth SVG bezier graph with Y-axis (habit count) and X-axis (dates) |
| 📅 Month picker | Animated bottom sheet — select any month of any year |
| 💾 Local persistence | AsyncStorage — works 100% offline, instant |
| ☁️ Cloud sync | MongoDB Atlas — all data backed up, accessible across devices |
| 🎨 Dark theme | Deep navy `#0E0E1A` with teal `#4DFFDB` and purple `#C44DFF` accents |
| 📊 Stats strip | Live count of habits, completions, and active days |
| 🗑️ Delete habits | Long press habit name to remove |
| 🔁 Sync indicator | Shows `syncing / synced / offline` status in header |
```
---

## 🗄️ Data Model

```typescript
// A single trackable habit
interface Habit {
  id: string;          // unique ID (timestamp + random)
  name: string;        // e.g. "meditate"
  color: string;       // random pastel accent colour
  createdAt: string;   // ISO timestamp
}

// Data stored per month
interface MonthData {
  habits: Habit[];
  completions: Record<string, string[]>;
  // key = "YYYY-MM-DD", value = array of completed habitIds
  // e.g. { "2026-02-14": ["abc123", "def456"] }
}

// Full app state (what gets saved locally + synced to Mongo)
interface AppState {
  selectedMonth: string;              // "YYYY-MM" — persists across sessions
  monthData: Record<string, MonthData>; // one entry per month
}
```

### Sync Strategy

```
Every tap/add/delete
       ↓
AsyncStorage (instant — never blocks UI)
       ↓ fire-and-forget
MongoDB Atlas Data API
       ↑ on app launch
Merge remote into local (local wins conflicts)
```

---

## ☁️ MongoDB Atlas Setup — Step by Step

### Step 1 — Create a free Atlas account

1. Go to **[cloud.mongodb.com](https://cloud.mongodb.com)**
2. Click **"Try Free"** and sign up with Google or email
3. Choose the **Free (M0)** tier
4. Pick any cloud provider (AWS/GCP/Azure) and the region closest to you
5. Click **"Create Cluster"** — takes about 2 minutes

---

### Step 2 — Create a database user

1. In the left sidebar click **"Database Access"**
2. Click **"+ Add New Database User"**
3. Choose **"Password"** authentication
4. Set a username (e.g. `habituser`) and a strong password
5. Under **"Database User Privileges"** select **"Read and write to any database"**
6. Click **"Add User"**

> ⚠️ Save this username and password — you'll need them for the connection string

---

### Step 3 — Allow network access

1. In the left sidebar click **"Network Access"**
2. Click **"+ Add IP Address"**
3. Click **"Allow Access from Anywhere"** → this adds `0.0.0.0/0`
4. Click **"Confirm"**

> This is fine for a personal app. For production you'd restrict to specific IPs.

---

### Step 4 — Create the database and collection

1. In the left sidebar click **"Database"** → click **"Browse Collections"**
2. Click **"+ Create Database"**
3. Database Name: `habit_tracker`
4. Collection Name: `states`
5. Click **"Create"**

---

### Step 5 — Enable the Data API

1. In the left sidebar click **"App Services"**
2. Click **"Create a New App"** → choose **"Build your own App"**
3. Give it any name (e.g. `HabitTrackerAPI`) and link it to your cluster
4. Click **"Create App Services Application"**
5. In the left panel of App Services click **"HTTPS Endpoints"** → then **"Data API"**
6. Toggle **"Enable the Data API"** → ON
7. Click **"Save Draft"** then **"Review & Deploy"**

---

### Step 6 — Create an API Key

1. Still inside App Services, click **"App Users"** in the left panel
2. Click the **"API Keys"** tab
3. Click **"+ Create API Key"**
4. Give it a name: `HabitTrackerKey`
5. Click **"Save"** — **copy the key immediately**, it won't show again

---

### Step 7 — Get your App ID

1. At the top of the App Services page you'll see your **App ID**
2. It looks like: `habitTrackerAPI-abcde`
3. Copy it

---

### Step 8 — Get your Cluster name

1. Go back to **"Database"** in Atlas
2. Your cluster name is shown at the top — usually `Cluster0`

---

### Step 9 — Paste values into `utils/mongo.ts`

Open `utils/mongo.ts` and replace the config block at the top:

```typescript
const ATLAS_APP_ID = 'habitTrackerAPI-abcde';   // your App ID from Step 7
const ATLAS_API_KEY = 'your-api-key-here';       // the key from Step 6
const ATLAS_CLUSTER = 'Cluster0';                // your cluster name from Step 8
const DB_NAME = 'habit_tracker';                 // must match Step 4
const COLLECTION = 'states';                     // must match Step 4
```

---

### Step 10 — Test it

1. Run `npx expo start` and open the app
2. Add a habit and toggle a day
3. You should see `✓ synced` briefly appear in the header
4. Go to Atlas → Browse Collections → `habit_tracker.states`
5. You should see a document with your userId and full state

---

### What each value means

| Variable | Where to find it | Example |
|----------|-----------------|---------|
| `ATLAS_APP_ID` | App Services → your app → top of page | `data-abcde` |
| `ATLAS_API_KEY` | App Services → App Users → API Keys | `abc123xyz...` |
| `ATLAS_CLUSTER` | Atlas → Database → cluster name | `Cluster0` |
| `DB_NAME` | The database you created in Step 4 | `habit_tracker` |
| `COLLECTION` | The collection you created in Step 4 | `states` |

---

## 🎨 Logo Generation Prompt

Use this prompt in **Midjourney**, **DALL-E 3**, **Adobe Firefly**, or **Ideogram**:

```
Minimalist app icon for a habit tracker called "Lumino".
A smooth glowing curve line rising from left to right, 
like a consistency graph, rendered in luminous teal (#4DFFDB) 
with a subtle purple gradient fade (#C44DFF).
Dark navy background (#0E0E1A).
The curve is soft and organic, slightly thick stroke, 
with a small glowing dot at the peak — like a star or a 
moment of achievement.
Clean, modern, geometric, no text.
App icon style, rounded square canvas, 
ultra-minimal, premium dark theme.
Style: flat vector with soft glow, not 3D.
```

### Logo variations to try

**Variation 1 — Notebook inspired:**
```
App icon: an open notebook page with a soft glowing dot-grid pattern,
teal ink marks forming a rising curve across the page.
Dark navy background. Minimal. Premium. No text.
Rounded square canvas. Flat vector style.
```

**Variation 2 — Abstract motion:**
```
App icon: abstract upward flowing ribbon of light,
teal to purple gradient, smooth bezier curve shape.
Deep dark navy background. Glowing, ethereal.
Minimal, no text, rounded square, icon style.
```

---

## 🛠️ Dependencies

```json
{
  "expo": "~51.0.0",
  "expo-router": "~3.5.0",
  "expo-status-bar": "~1.12.1",
  "react": "18.2.0",
  "react-native": "0.74.1",
  "@react-native-async-storage/async-storage": "1.23.1",
  "react-native-svg": "15.2.0",
  "react-native-safe-area-context": "^4.10.1"
}
```

Install all at once:
```bash
npx expo install react-native-svg @react-native-async-storage/async-storage react-native-safe-area-context
```

---

## 🎨 Design System
```
| Token | Value | Usage |
|-------|-------|-------|
| Background | `#0E0E1A` | All screens |
| Primary | `#4DFFDB` | Teal — active states, CTA, today |
| Accent | `#C44DFF` | Purple — current month, graph gradient start |
| Gold | `#FFD93D` | Today's dot on graph |
| Pink | `#FF6B9D` | Offline indicator, habit colour option |
| Text primary | `#FFFFFF` | Headings |
| Text secondary | `rgba(255,255,255,0.4)` | Labels, hints |
| Text muted | `rgba(255,255,255,0.2)` | Section labels, dates |
| Card bg | `rgba(255,255,255,0.03)` | Grid card, graph card |
| Border | `rgba(255,255,255,0.06)` | Subtle dividers |

Typography is intentionally **serif italic** for all display text — giving the app a notebook/journal personality rather than a productivity dashboard feel.
```
---

## 📱 Screen Overview

### Landing Screen (`app/index.tsx`)
- Animated fade + slide on load
- Pulsing glow orb background (SVG radial gradient)
- Random motivational quote on each open
- Mini decorative bar chart
- Pulsing "Begin your streak" CTA button

### Dashboard Screen (`app/dashboard.tsx`)
- Back navigation + app name + monthly completion % badge
- Month picker (tap to open bottom sheet)
- Stats strip: habit count / total completions / active days
- **Daily grid**: day numbers (fixed left) + habit columns (horizontal scroll)
  - Today's row highlighted in teal
  - Row completion pip on right edge
  - Long press habit name to delete
- **Add habit** input with animated + button
- **Consistency curve** graph — all days visible, no scroll required
  - Y-axis: 0 to total habits
  - X-axis: day 1, 5, 10, 15, 20, 25, last day
  - Today marked with gold dot

### Month Picker Bottom Sheet (`components/MonthPicker.tsx`)
- Tap month name to open
- Animated spring slide-up
- Horizontal year strip (±5 years from current)
- 4-column month grid
- Current month shown in purple, selected in teal
- "Done" button to close

---

## 🔄 Offline Behaviour

The app is **local-first**. All data is written to AsyncStorage instantly. MongoDB sync is fire-and-forget and never blocks the UI. If you're offline:

- The app works completely normally
- A small `⚡ offline` label appears briefly in the header
- When you come back online, the next interaction will sync

---

## 🚢 Deploying / Building

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android (APK)
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios
```

---

## 📄 License

MIT — build whatever you want with it.

---

*Built with React Native + Expo + MongoDB Atlas. Designed to motivate through progress, not pressure.*#