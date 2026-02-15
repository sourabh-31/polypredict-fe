# 🧠 PolyPredict – Prediction Market Simulator

A modern prediction market simulation platform built with **Next.js (App Router)** featuring virtual trading, wallet management, live price updates, and persistent state handling.

This project focuses on scalable frontend architecture, clean UI, and production-level patterns.

---

## 🚀 Tech Stack

### Frontend

- **Next.js (App Router)**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide Icons**

### State Management

- **Zustand**
  - Wallet management
  - Position tracking
  - Profit & Loss calculation
  - Local persistence (user-based storage)

### API Handling

- **Next.js Route Handlers (`route.ts`)**
- Server-side proxy pattern for third-party API integration

---

## 🏗 Architecture Highlights

- App Router structure (`app/`)
- Server-side API proxying
- Client hydration control (`hasHydrated`)
- Weighted average buy logic
- Persistent wallet per user (guest & logged-in isolation)

---

## ⚙️ Getting Started

Install dependencies:

```bash
pnpm install
```

Run the server:

```bash
pnpm run dev
```

## 🌐 CORS Issue & How It Was Solved

### ❌ The Problem

While integrating the external prediction API, direct browser requests were blocked due to **CORS (Cross-Origin Resource Sharing)** restrictions.

Example of the failing request:

```ts
fetch("https://external-api.com/events");
```

The browser rejected this request because:

- The external API did not include the required `Access-Control-Allow-Origin` headers
- Browsers enforce CORS policies to prevent cross-origin security risks
- Client-side applications cannot bypass these restrictions

This resulted in a CORS error in the browser console and blocked access to the data.

---

### ✅ The Solution – Server-Side Proxy Using `route.ts`

To resolve the issue, I implemented a **server-side proxy** using Next.js App Router Route Handlers.

Instead of calling the external API directly from the frontend, I created:

```
app/api/events/route.ts
```

```ts
export async function GET() {
  const res = await fetch("https://external-api.com/events");
  const data = await res.json();

  return Response.json(data);
}
```

Now the frontend calls:

```ts
fetch("/api/events");
```

---

### 🚀 Why This Works

- The browser communicates only with its own origin (`/api/events`)
- The Next.js server performs the external API request
- Server-to-server requests are not restricted by browser CORS policies
- Sensitive API keys (if needed) remain secure on the server

This approach follows a **production-grade architecture pattern** commonly used when integrating third-party APIs in modern web applications.

---

### 🎨 Design Decisions

- **Light & Dark Mode Support** — Implemented using shadcn/ui's slate theme for seamless theming with consistent color tokens across both modes. The slate palette provides excellent contrast ratios and readability in both environments.

- **Space Grotesk Typography** — Selected for its modern geometric design and excellent legibility at all sizes. This open-source typeface brings a contemporary, tech-forward aesthetic while maintaining professional readability for data-heavy interfaces.

- **Component-First Architecture** — Built entirely with shadcn/ui components for consistency, accessibility (ARIA-compliant), and maintainability. This approach ensures a cohesive design system throughout the application.

- **Responsive & Mobile-Optimized** — Every component adapts fluidly across devices, with careful attention to touch targets, spacing, and information hierarchy on smaller screens.

---

### 🔮 Future Improvements

- **Expanded Event Categories & Advanced Filtering** — Currently focused on political events due to limited API topics (5 categories). Future iterations would include sports, entertainment, economics, and custom user-created markets with comprehensive search, multi-filter options, and category-based navigation.

- **Infinite Scroll + List Virtualization** — As the positions tab scales with more user activity, implementing infinite loading with virtualization libraries (e.g., `@tanstack/react-virtual` or `react-window`) would dramatically improve performance by rendering only visible items in the DOM.

- **Precision Number Handling** — Integrate `decimal.js` or `bignumber.js` for financial calculations. Current implementation displays up to 4 decimal points, which suffices for this demo but production apps require arbitrary-precision arithmetic to prevent floating-point errors in monetary transactions.

- **Real-time WebSocket Integration** — Replace polling with WebSocket connections for live market updates, enabling instant price changes, order book updates, and position notifications without repeated HTTP requests.

- **Advanced Analytics Dashboard** — Add portfolio performance tracking, profit/loss graphs, historical trend analysis, and market sentiment indicators to give users deeper insights into their trading patterns.
