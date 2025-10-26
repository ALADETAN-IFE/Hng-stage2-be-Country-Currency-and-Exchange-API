# Backend Task: Country Currency & Exchange API

Build a RESTful API that fetches country data from external APIs, caches it in a MySQL database, and provides CRUD operations.

## Functionalities

- Fetch country data from: `https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies`
- For each country, extract the currency code (e.g. `NGN`, `USD`, `GBP`).
- Fetch exchange rates from: `https://open.er-api.com/v6/latest/USD` and match each country's currency with its rate (e.g. `NGN` → `1600`).
- Compute `estimated_gdp = population × random(1000–2000) ÷ exchange_rate`.
- Store or update everything in MySQL as cached data.

## Endpoints

- `POST /countries/refresh` — Fetch all countries and exchange rates, then cache/update them in the database.
- `GET /countries` — Get all countries from the DB (supports filters and sorting): `?region=Africa`, `?currency=NGN`, `?sort=gdp_desc`.
- `GET /countries/:name` — Get one country by name.
- `DELETE /countries/:name` — Delete a country record.
- `GET /status` — Show total countries and last refresh timestamp.
- `GET /countries/image` — Serve the generated summary image.

## Country Fields

- `id` — auto-generated
- `name` — required
- `capital` — optional
- `region` — optional
- `population` — required
- `currency_code` — required
- `exchange_rate` — required
- `estimated_gdp` — computed from `population × random(1000–2000) ÷ exchange_rate`
- `flag_url` — optional
- `last_refreshed_at` — auto timestamp

## Validation Rules

- `name`, `population`, and `currency_code` are required.
- Return `400 Bad Request` for invalid or missing data.

Example error response:

```json
{
  "error": "Validation failed",
  "details": {
    "currency_code": "is required"
  }
}
```

## External APIs

- Countries: `https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies`
- Exchange rates: `https://open.er-api.com/v6/latest/USD`

## Sample GET Response

Request: `GET /countries?region=Africa`

```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  },
  {
    "id": 2,
    "name": "Ghana",
    "capital": "Accra",
    "region": "Africa",
    "population": 31072940,
    "currency_code": "GHS",
    "exchange_rate": 15.34,
    "estimated_gdp": 3029834520.6,
    "flag_url": "https://flagcdn.com/gh.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

## Sample Status Response

Request: `GET /status`

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

## Refresh Behavior (POST /countries/refresh)

### Currency Handling

- If a country has multiple currencies, store only the first currency code from the array.
- If the `currencies` array is empty:
  - Do NOT call the exchange rate API for this country.
  - Set `currency_code` to `null`.
  - Set `exchange_rate` to `null`.
  - Set `estimated_gdp` to `0`.
  - Still store the country record.
- If `currency_code` is not found in the exchange rates API:
  - Set `exchange_rate` to `null`.
  - Set `estimated_gdp` to `null`.
  - Still store the country record.

### Update vs Insert Logic

- Match existing countries by `name` (case-insensitive comparison).
- If a country exists: update all fields, including recalculating `estimated_gdp` with a new random multiplier.
- If a country doesn't exist: insert a new record.
- The random multiplier (`1000–2000`) should be generated fresh on each refresh for each country.
- A successful refresh should update the global `last_refreshed_at` timestamp.

## Image Generation

When `POST /countries/refresh` runs:

- After saving countries in the database, generate an image (for example `cache/summary.png`) containing:
  - Total number of countries
  - Top 5 countries by estimated GDP
  - Timestamp of last refresh
- Save the generated image on disk at `cache/summary.png`.
- New endpoint: `GET /countries/image` — Serve the generated summary image.
- If no image exists, return:

```json
{ "error": "Summary image not found" }
```

## External API Error Handling

- If either external API fails or times out:
  - Return `503 Service Unavailable`.
  - Response body:

```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from [API name]"
}
```

- Do not modify existing database records if a refresh fails.

## Error Handling

Return consistent JSON responses:

- `404` → `{ "error": "Country not found" }`
- `400` → `{ "error": "Validation failed" }`
- `500` → `{ "error": "Internal server error" }`

## Technical Notes

- Use a database (MySQL) for persistence.
- Only update cache when `POST /countries/refresh` is called.
- Use a `.env` file for configuration (DB, port, etc.).
- JSON responses only.
- Include a `README.md` with setup instructions.

## Submission Instructions

- You can implement this in any language (Fortran, C, Assembly, etc. allowed).
- Hosting: Vercel is forbidden for this cohort. Use other hosting options like Railway, Heroku, AWS, PXXL App, etc.
- Include the GitHub repo link and:
  - Clear `README` with setup instructions.
  - Instructions to run locally.
  - List of dependencies and how to install them.
  - Environment variables needed (if any).
  - Tests and API documentation where relevant.

---

If you'd like, I can also apply similar formatting fixes to other documentation files in the repo (for example `README.md` or `API_DOCS.md`).
