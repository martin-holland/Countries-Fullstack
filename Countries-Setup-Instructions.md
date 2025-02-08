# Countries Feature Setup Instructions

## 1. API Endpoints

Using the REST Countries API (v3.1):

### Base URL

```
https://restcountries.com/v3.1
```

### Endpoints Used

1. Get All Countries

```
GET /all
```

- Returns all countries
- Used in CountriesList component
- No parameters required
- Response includes basic country information

2. Get Country by Code

```
GET /alpha/{code}
```

- Returns specific country by code (e.g., FIN, USA)
- Used in CountryDetail component
- Parameters:
  - code: 3-letter country code (cca3)
- Returns array with single country

### Example Response Structure

```json
{
  "name": {
    "common": "Finland",
    "official": "Republic of Finland",
    "nativeName": {}
  },
  "capital": ["Helsinki"],
  "region": "Europe",
  "subregion": "Northern Europe",
  "population": 5530719,
  "flags": {
    "png": "https://flagcdn.com/w320/fi.png",
    "svg": "https://flagcdn.com/fi.svg",
    "alt": "Description of flag"
  },
  "cca3": "FIN"
}
```

## 2. Types Setup

Created `src/types/country.ts` with interfaces for:

- CountryName (common, official, nativeName)
- CountryFlags (png, svg, alt)
- Country (main country data interface)
- CountryState (Redux state interface)

## 3. API Service Setup

Created `src/api/services/countries.ts` with:

- getAllCountries function
- getCountryByCode function
  Both using axios instance from api/axios.ts

## 4. Redux Setup

Created `src/store/slices/countriesSlice.ts` with:

- Initial state
- Async thunks for fetching countries and single country
- Slice with reducers and extra reducers
- Selectors for countries data, loading state, errors, and selected country

Updated `src/store/store.ts` to:

- Import countries reducer
- Add countries reducer to store configuration

## 5. Components Setup

Created three main components:

### CountryCard Component (`src/components/Countries/CountryCard.tsx`)

- Card layout for individual country
- Displays flag, name, region, capital, population
- Links to country detail page using country common name
- Uses URL encoding for special characters in country names

### CountriesList Component (`src/components/Countries/CountriesList.tsx`)

- Grid layout of CountryCards
- Handles loading and error states
- Fetches countries on mount
- Responsive grid layout

### CountryDetail Component (`src/components/Countries/CountryDetail.tsx`)

- Detailed view of single country
- Back navigation
- Expanded country information
- Handles loading and error states
- Finds country by common name from existing countries list
- Uses encoded common name for identification

## 6. Route Setup

Updated `src/App.tsx` with new routes:

- / (home) -> CountriesList
- /countries -> CountriesList
- /countries/:name -> CountryDetail

## 7. Navigation Update

Updated `
