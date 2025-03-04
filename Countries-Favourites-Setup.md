# Countries Favorites Feature Setup

This document outlines the implementation of the country favorites feature in the Countries Fullstack application. The feature allows authenticated users to save countries to their favorites list and view them in a dedicated page.

## Table of Contents

1. [Database Setup](#database-setup)
2. [Frontend Implementation](#frontend-implementation)
3. [API Service](#api-service)
4. [Components](#components)
5. [Performance Optimizations](#performance-optimizations)
6. [Usage](#usage)
7. [Troubleshooting](#troubleshooting)

## Database Setup

### Create the Favorites Table

Run the following SQL in your Supabase SQL Editor to create the favorites table with proper Row Level Security (RLS):

```sql
-- Create the favorites table
CREATE TABLE country_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_flag TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE country_favorites ENABLE ROW LEVEL SECURITY;

-- Create policy for reading data
CREATE POLICY "Users can read own favorites"
ON country_favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for inserting data
CREATE POLICY "Users can insert own favorites"
ON country_favorites
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  user_id = auth.uid()
);

-- Create policy for deleting data
CREATE POLICY "Users can delete own favorites"
ON country_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger to automatically set user_id
CREATE OR REPLACE FUNCTION set_favorite_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS set_favorite_user_id_trigger ON country_favorites;
CREATE TRIGGER set_favorite_user_id_trigger
BEFORE INSERT ON country_favorites
FOR EACH ROW
EXECUTE FUNCTION set_favorite_user_id();
```

This setup ensures that:

- Each favorite is linked to a user
- Users can only see, add, and delete their own favorites
- The user_id is automatically set when a favorite is created

## Frontend Implementation

### Type Definitions

Create a type definition for country favorites in `frontend/src/types/favorite.ts`:

```typescript
export interface CountryFavorite {
  id: string;
  created_at: string;
  country_name: string;
  country_code: string;
  country_flag: string;
  user_id: string;
}

export interface FavoritesState {
  favorites: CountryFavorite[];
  loading: boolean;
  error: string | null;
}
```

## API Service

Create a service to handle favorites operations in `frontend/src/api/services/favorites.ts`:

```typescript
import { supabase } from "../../config/supabase";
import { Country } from "../../types/country";
import { CountryFavorite } from "../../types/favorite";

// Cache for favorite status to reduce redundant API calls
let favoritesCache: CountryFavorite[] | null = null;
let lastFetchTime = 0;
const CACHE_EXPIRY = 30000; // 30 seconds

export const favoritesApi = {
  /**
   * Get all favorites for the current user
   * @param useCache Whether to use cached data if available
   */
  async getFavorites(useCache = true): Promise<CountryFavorite[]> {
    const now = Date.now();

    // Return cached data if it's fresh and useCache is true
    if (useCache && favoritesCache && now - lastFetchTime < CACHE_EXPIRY) {
      return favoritesCache;
    }

    const { data, error } = await supabase
      .from("country_favorites")
      .select("*");

    if (error) {
      console.error("Error fetching favorites:", error);
      throw new Error(error.message);
    }

    // Update cache
    favoritesCache = data || [];
    lastFetchTime = now;

    return favoritesCache;
  },

  /**
   * Add a country to favorites
   */
  async addFavorite(country: Country): Promise<CountryFavorite> {
    const { data, error } = await supabase
      .from("country_favorites")
      .insert([
        {
          country_name: country.name.common,
          country_code: country.cca3,
          country_flag: country.flags.png,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding favorite:", error);
      throw new Error(error.message);
    }

    // Update cache if it exists
    if (favoritesCache) {
      favoritesCache.push(data);
    }

    return data;
  },

  /**
   * Remove a country from favorites
   */
  async removeFavorite(countryName: string): Promise<void> {
    const { error } = await supabase
      .from("country_favorites")
      .delete()
      .eq("country_name", countryName);

    if (error) {
      console.error("Error removing favorite:", error);
      throw new Error(error.message);
    }

    // Update cache if it exists
    if (favoritesCache) {
      favoritesCache = favoritesCache.filter(
        (fav) => fav.country_name !== countryName
      );
    }
  },

  /**
   * Check if a country is in favorites
   */
  async isFavorite(countryName: string): Promise<boolean> {
    // Try to use cache first
    if (favoritesCache) {
      const found = favoritesCache.some(
        (fav) => fav.country_name === countryName
      );
      return found;
    }

    // If no cache, make a targeted query
    const { data, error } = await supabase
      .from("country_favorites")
      .select("id")
      .eq("country_name", countryName)
      .maybeSingle();

    if (error) {
      console.error("Error checking favorite status:", error);
      throw new Error(error.message);
    }

    return !!data;
  },

  /**
   * Clear the favorites cache
   */
  clearCache() {
    favoritesCache = null;
    lastFetchTime = 0;
  },
};
```

## Components

### FavoriteButton Component

Create a reusable favorite button in `frontend/src/components/Countries/FavoriteButton.tsx`:

```typescript
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { favoritesApi } from "../../api/services/favorites";
import { useAuth } from "../../context/AuthContext";
import { Country } from "../../types/country";

interface FavoriteButtonProps {
  country: Country;
  onToggle?: (isFavorite: boolean) => void;
}

export const FavoriteButton = ({ country, onToggle }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only check favorite status if user is logged in and component is mounted
    if (!user || isInitialized) return;

    const checkFavoriteStatus = async () => {
      try {
        const status = await favoritesApi.isFavorite(country.name.common);
        setIsFavorite(status);
        setIsInitialized(true);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [country.name.common, user, isInitialized]);

  const handleToggleFavorite = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (isFavorite) {
        await favoritesApi.removeFavorite(country.name.common);
        setIsFavorite(false);
      } else {
        await favoritesApi.addFavorite(country);
        setIsFavorite(true);
      }

      if (onToggle) {
        onToggle(!isFavorite);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
      <IconButton
        onClick={handleToggleFavorite}
        disabled={isLoading}
        color="primary"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );
};
```

### Favorites Page Component

Create a page to display all favorites in `frontend/src/components/Countries/Favorites.tsx`:

```typescript
import { Alert, Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { favoritesApi } from "../../api/services/favorites";
import { useAuth } from "../../context/AuthContext";
import { useAppSelector } from "../../store/hooks";
import { selectAllCountries } from "../../store/slices/countriesSlice";
import { Country } from "../../types/country";
import { CountryFavorite } from "../../types/favorite";
import { CountryCard } from "./CountryCard";

export const Favorites = () => {
  const [favorites, setFavorites] = useState<CountryFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const allCountries = useAppSelector(selectAllCountries);

  useEffect(() => {
    // Only fetch favorites if user is logged in
    if (!user) return;

    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);

      try {
        // Force a fresh fetch when the component mounts
        const data = await favoritesApi.getFavorites(false);
        setFavorites(data);
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Failed to load favorites. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();

    // Clear cache when component unmounts
    return () => {
      // No need to clear cache on unmount as it's useful for other components
    };
  }, [user]);

  // Convert CountryFavorite to Country format for CountryCard
  const convertToCountry = (favorite: CountryFavorite): Country => {
    // First try to find the full country data from the store
    const fullCountry = allCountries.find(
      (c) => c.name.common === favorite.country_name
    );

    // If we found the full country data, use it
    if (fullCountry) {
      return fullCountry;
    }

    // Otherwise, create a minimal country object with the data we have
    return {
      name: {
        common: favorite.country_name,
        official: favorite.country_name,
      },
      cca3: favorite.country_code,
      flags: {
        png: favorite.country_flag,
        svg: favorite.country_flag,
      },
      region: "Favorite",
      subregion: "Saved Country",
      population: 0,
      capital: ["Favorite"],
      currencies: {
        FAV: {
          name: "Favorite Currency",
          symbol: "♥",
        },
      },
    };
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please log in to view and manage your favorite countries.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Favorite Countries
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {favorites.length === 0 ? (
        <Alert severity="info">
          You haven't added any countries to your favorites yet.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((favorite) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={favorite.id}>
              <CountryCard country={convertToCountry(favorite)} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
```

### Update App.tsx

Add the favorites route to `frontend/src/App.tsx`:

```typescript
// Add import
import { Favorites } from "./components/Countries/Favorites";

// Add route inside the Routes component
<Route
  path="/favorites"
  element={
    <ProtectedRoute>
      <Favorites />
    </ProtectedRoute>
  }
/>;
```

### Update Navigation.tsx

Add a link to the favorites page in `frontend/src/components/Navigation.tsx`:

```typescript
// Add import
import FavoriteIcon from "@mui/icons-material/Favorite";

// Add button inside the navigation bar
{
  user && (
    <Button
      color="inherit"
      component={RouterLink}
      to="/favorites"
      startIcon={<FavoriteIcon />}
    >
      Favorites
    </Button>
  );
}
```

### Update CountryCard and CountryDetail

Add the favorite button to the country card and detail pages:

```typescript
// In CountryCard.tsx
<CardActions sx={{ mt: "auto", justifyContent: "flex-end" }}>
  <FavoriteButton country={country} />
</CardActions>

// In CountryDetail.tsx
<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
  <Typography variant="h4" gutterBottom sx={{ flexGrow: 1 }}>
    {country.name.common}
  </Typography>
  <FavoriteButton country={country} />
</Box>
```

## Performance Optimizations

The favorites feature includes several performance optimizations:

1. **Caching System**:

   - In-memory cache for favorites data
   - 30-second cache expiration
   - Cache updates when favorites are added or removed
   - Optional cache bypass for fresh data

2. **Optimized API Calls**:

   - Uses cached data when possible
   - Makes targeted queries for checking favorite status
   - Prevents redundant API calls

3. **Component Optimizations**:
   - Initialization flags to prevent repeated API calls
   - Proper dependency arrays in useEffect hooks
   - Reuses existing components (CountryCard) for consistency

## Usage

1. **Adding Favorites**:

   - Browse countries in the main list or detail pages
   - Click the heart icon to add a country to favorites
   - The heart icon will fill to indicate the country is a favorite

2. **Viewing Favorites**:

   - Click the "Favorites" link in the navigation bar
   - View all your favorite countries in a grid layout
   - Click on a country card to view its details

3. **Removing Favorites**:
   - Click the filled heart icon on any country to remove it from favorites
   - The heart icon will change to an outline to indicate the country is no longer a favorite

## Troubleshooting

### Common Issues

1. **Favorites not showing up**:

   - Ensure you are logged in
   - Check browser console for errors
   - Verify the Supabase table and RLS policies are set up correctly

2. **Excessive API calls**:

   - Check for unnecessary re-renders in components
   - Ensure useEffect dependencies are properly set
   - Verify the caching system is working correctly

3. **Inconsistent favorite status**:
   - Clear the browser cache and reload the page
   - Check for race conditions in API calls
   - Verify the cache is being updated correctly

### Debugging

To debug the favorites feature:

1. Check browser console for errors
2. Use browser network tab to monitor API calls
3. Add console.log statements to track component lifecycle and state changes
4. Verify Supabase RLS policies using the Supabase dashboard

If issues persist, try clearing the cache manually:

```typescript
// In browser console
import { favoritesApi } from "./api/services/favorites";
favoritesApi.clearCache();
```

---

This documentation provides a comprehensive guide to the favorites feature implementation. For further assistance, refer to the code comments or contact the development team.
