import { Alert, Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { favoritesApi } from "../../api/services/favorites";
import { useAuth } from "../../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllCountries,
  selectAllCountries,
} from "../../store/slices/countriesSlice";
import { Country } from "../../types/country";
import { CountryFavorite } from "../../types/favorite";
import { CountryCard } from "./CountryCard";

export const Favorites = () => {
  const [favorites, setFavorites] = useState<CountryFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const allCountries = useAppSelector(selectAllCountries);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (allCountries.length === 0) {
      dispatch(fetchAllCountries());
    }
  }, [allCountries, dispatch]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

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
