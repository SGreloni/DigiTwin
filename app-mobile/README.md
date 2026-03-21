# DigiTwin Mobile App (Frontend)

This is the frontend component of the **DigiTwin** hydroponic crop-simulation platform. It is a web application optimized for mobile devices, built with [Next.js](https://nextjs.org/) and [React](https://react.dev/), designed to interact with the DigiTwin FastAPI backend.

The application allows users to configure crop simulation parameters, run the PCSE/WOFOST model via the backend, and visualize the daily growth results (like Development Stage, Leaf Area Index, and Biomass) using interactive charts.

---

## Features

- **Dashboard**: Quick overview of recent simulations and a shortcut to start a new one.
- **Simulation Configuration**: Input parameters like crop type (Barley, Potato), duration, temperature, light, pH, and EC.
- **Interactive Results**: View simulation outputs in daily time-series charts powered by [Recharts](https://recharts.org/).
- **Simulation History**: Browse and review previously run simulations stored locally or fetched from the backend.
- **Dark Mode Support**: Built-in support for light and dark themes.

## Tech Stack & Requirements

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) primitives
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/)
- **Node.js**: v18+ recommended.

---

## Running Locally

To run the frontend application locally, you'll need Node.js and `npm` installed.

### 1. Install Dependencies

Open your terminal, navigate to the `app-mobile` directory, and run:

```bash
cd app-mobile
npm install
```

### 2. Configure Environment Variables

The frontend needs to know where the FastAPI backend is running. Create a `.env.local` file in the `app-mobile` directory (or just export the variable):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

*(Ensure the backend is running on port 8000 before running simulations).*

### 3. Start the Development Server

Start the Next.js development server:

```bash
npm run dev
```

### 4. Open the App

Open [http://localhost:3000](http://localhost:3000) in your browser. Since this is a mobile-first design, it is highly recommended to view the page using your browser's Developer Tools in **Mobile View** (e.g., iPhone 14 Pro simulation).

---

## Building for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

## Running with Docker Compose

If you prefer to run the entire stack (backend + frontend) using Docker, you can use the `docker-compose.yml` file located in the root of the repository:

```bash
cd ..
docker compose up --build
```

The frontend will be available at `http://localhost:3000` and automatically configured to communicate with the backend container.
