# DigiTwin – Mobile App Frontend Requirements

> **Context**
> DigiTwin is a digital-twin platform for **hydroponic barley cultivation**.
> The backend runs [PCSE/WOFOST](https://pcse.readthedocs.io/) crop simulations, feeding user-supplied environmental parameters into the model and returning daily growth predictions.
> The mobile app lets growers **configure**, **run**, and **visualise** simulations from their phone.

---

## 1. Target Platforms

| Platform | Minimum version |
|----------|-----------------|
| iOS      | 15+             |
| Android  | 12+             |

A **cross-platform** framework (e.g. React Native, Flutter) is recommended.

---

## 2. User Roles

| Role       | Description |
|------------|-------------|
| **Grower** | Primary user. Configures simulations, views results, manages history. |
| **Admin**  | (future) Manages crops/varieties catalogue, views usage analytics. |

---

## 3. Feature Map

### 3.1 Authentication & Onboarding
- Sign-up / login (email + password, or social OAuth).
- JWT-based session management.
- Simple onboarding carousel explaining the app.

### 3.2 Dashboard (Home)
- Summary cards:
  - **Active simulation** status (if one is running).
  - **Last simulation** quick summary (crop, date, key results).
- Quick-action button: **"New Simulation"**.

### 3.3 New Simulation Screen
The user fills in the parameters the backend needs (matches the notebook inputs):

| Parameter             | Type / Options                         | Default     | Notes |
|-----------------------|----------------------------------------|-------------|-------|
| `crop_name`           | Picker/dropdown (from available crops) | `barley`    | From backend catalogue |
| `variety_name`        | Picker/dropdown per crop               | `Barley_Hydroponic_Forage_AR_Moderate` | From backend catalogue |
| `fecha_inicio`        | Date picker                            | today       | Simulation start date (ISO `YYYY-MM-DD`) |
| `dias_cultivo`        | Numeric input (1–365)                  | `10`        | Cultivation duration in days |
| `temperatura_ambiente`| Numeric slider/input (°C)              | `22.0`      | Ambient temperature |
| `luz`                 | Segmented control: `baja`, `media`, `alta` | `media` | Light level mapping to irradiance |
| `ph`                  | Numeric slider (0–14)                  | `6.0`       | Nutrient solution pH |
| `ec`                  | Numeric slider (0–10 mS/cm)            | `2.0`       | Electrical conductivity |

After filling in, the user taps **"Run Simulation"** → POST to the API.

### 3.4 Simulation Results Screen
Once the backend responds, display:

1. **Key KPIs** (cards at the top):
   - Final yield estimate (`TWSO` last day) in kg/ha.
   - Total above-ground production (`TAGP` last day).
   - Final leaf area index (`LAI` last day).
   - Development stage (`DVS` last day).

2. **Daily time-series charts** (scrollable):
   - **DVS** (Development Stage) vs day.
   - **TAGP** (Total Above-Ground Production) vs day.
   - **LAI** (Leaf Area Index) vs day.
   - **SM** (Soil Moisture) vs day.

3. **Full daily table** (expandable / exportable):
   - Columns: `day`, `DVS`, `LAI`, `TAGP`, `TWSO`, `TWLV`, `TWST`, `TWRT`, `TRA`, `RD`, `SM`, `WWLOW`, `RFTRA`.

4. **Share / Export**: export results as CSV or share a simulation link.

### 3.5 Simulation History
- List of past simulations (stored in backend).
- Each card shows: date, crop, variety, final `TWSO`, status.
- Tap to view full results.
- Delete individual simulations.

### 3.6 Crop & Variety Catalogue (read-only)
- Browse available crops (e.g. barley).
- Browse varieties under each crop.
- Shows key parameter summary.

### 3.7 Settings / Profile
- Edit profile (name, email).
- Change password.
- Toggle dark mode.
- App version & about.

---

## 4. UI / UX Guidelines

- Clean, modern design (Material 3 / Cupertino-like).
- Dark mode support.
- Charts: use a performant charting library (e.g. `victory-native`, `fl_chart`).
- Loading states: skeleton placeholders while simulation runs.
- Error states: friendly messages when API fails (connection, timeout, 5xx).
- Responsive: support phones and small tablets.

---

## 5. Data Flow Summary

```
┌─────────────┐                ┌─────────────────┐
│  Mobile App  │ ──  REST  ──▶ │  FastAPI Backend │
│  (Frontend)  │ ◀── JSON ──  │  (api-backend/)  │
└─────────────┘                └─────────────────┘
                                      │
                                      ▼
                               PCSE/WOFOST Engine
```

- All communication is via **REST / JSON**.
- Authentication via **JWT Bearer tokens**.
- Simulation may take a few seconds → frontend shows a loading/progress indicator.

---

## 6. Non-Functional Requirements

| Category       | Requirement |
|----------------|-------------|
| Performance    | Simulation results should appear in < 10 s on average |
| Offline        | Simulation history viewable offline (local cache) |
| i18n           | Spanish by default; English second |
| Accessibility  | Min AA contrast, screen-reader labels |
| Security       | HTTPS only, JWT tokens, input validation |
