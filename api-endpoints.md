# DigiTwin – API Endpoints Documentation

> Base URL: `http://<host>:<port>/api/v1`
>
> **No authentication required** — all endpoints are open.

---

## 1. Crops Catalogue

### 1.1 `GET /crops` - List available crops

<details>
<summary>Details</summary>

**Response** `200 OK`:

```json
{
  "crops": ["barley", "potato"]
}
```

</details>

---

### 1.2 `GET /crops/{crop_name}/varieties` - List varieties for a crop

<details>
<summary>Details</summary>

**Example**: `GET /crops/barley/varieties`

**Response** `200 OK`:

```json
{
  "crop_name": "barley",
  "varieties": ["Barley_Hydroponic_Forage_AR_Moderate"]
}
```

**Errors**:
- `404`: crop not found or no varieties available.

</details>

---

## 2. Simulations

### 2.1 `POST /simulations` - Run a simulation

<details>
<summary>Details</summary>

**Request body** (`application/json`):

```json
{
  "crop_name": "barley",
  "variety_name": "Barley_Hydroponic_Forage_AR_Moderate",
  "fecha_inicio": "2024-01-01",
  "dias_cultivo": 10,
  "temperatura_ambiente": 22.0,
  "luz": "media",
  "ph": 6.0,
  "ec": 2.0
}
```

| Field                  | Type     | Required | Default     | Description |
|------------------------|----------|----------|-------------|-------------|
| `crop_name`            | string   | no       | `"barley"`  | Crop name |
| `variety_name`         | string   | no       | `"Barley_Hydroponic_Forage_AR_Moderate"` | Variety |
| `fecha_inicio`         | string (ISO date) | no | `"2024-01-01"` | Start date |
| `dias_cultivo`         | int (1–365) | no   | `10`        | Duration in days |
| `temperatura_ambiente` | float    | no       | `22.0`      | Temperature (°C) |
| `luz`                  | string   | no       | `"media"`   | `baja` / `media` / `alta` |
| `ph`                   | float    | no       | `6.0`       | pH (0–14) |
| `ec`                   | float    | no       | `2.0`       | EC (mS/cm, 0–10) |

**Response** `201 Created`:

```json
{
  "simulation_id": "uuid",
  "config": { ... },
  "summary": {
    "final_DVS": 0.123,
    "final_LAI": 0.05,
    "final_TAGP": 100.5,
    "final_TWSO": 50.2
  },
  "daily_results": [
    {
      "day": "2024-01-01",
      "DVS": 0.0, "LAI": 0.0, "TAGP": 0.0, "TWSO": 0.0,
      "TWLV": 0.0, "TWST": 0.0, "TWRT": 0.0, "TRA": 0.0,
      "RD": 10.0, "SM": 0.3, "WWLOW": 0.0, "RFTRA": 1.0
    }
  ],
  "created_at": "2026-03-21T12:00:00Z"
}
```

**Errors**: `400` invalid input, `422` validation errors, `500` simulation failure.

</details>

---

### 2.2 `GET /simulations` - List simulations

<details>
<summary>Details</summary>

**Query parameters**:

| Param  | Type | Default | Description |
|--------|------|---------|-------------|
| `skip`  | int  | `0`    | Pagination offset |
| `limit` | int  | `20`   | Max items per page |

**Response** `200 OK`:

```json
{
  "total": 42,
  "items": [
    {
      "simulation_id": "uuid",
      "crop_name": "barley",
      "variety_name": "...",
      "fecha_inicio": "2024-01-01",
      "dias_cultivo": 10,
      "final_TWSO": 50.2,
      "created_at": "2026-03-21T12:00:00Z"
    }
  ]
}
```

</details>

---

### 2.3 `GET /simulations/{simulation_id}` - Get simulation detail

<details>
<summary>Details</summary>

**Response** `200 OK`: same shape as the POST response (section 2.1).

**Errors**: `404` if not found.

</details>

---

### 2.4 `DELETE /simulations/{simulation_id}` - Delete a simulation

<details>
<summary>Details</summary>

**Response** `204 No Content`.

**Errors**: `404` if not found.

</details>

---

### 2.5 `GET /simulations/{simulation_id}/export` - Export results as CSV

<details>
<summary>Details</summary>

**Response** `200 OK` with `Content-Type: text/csv`.

CSV columns: `day,DVS,LAI,TAGP,TWSO,TWLV,TWST,TWRT,TRA,RD,SM,WWLOW,RFTRA`.

**Errors**: `404` if not found.

</details>

---

## 3. Health

### 3.1 `GET /health` - Health check

<details>
<summary>Details</summary>

**Response** `200 OK`:

```json
{ "status": "ok", "version": "1.0.0" }
```

</details>
