import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAllCountries,
  selectAllCountries,
  selectCountriesError,
  selectCountriesLoading,
} from "../../store/slices/countriesSlice";
import { CountryCard } from "./CountryCard";

export const CountriesList = () => {
  const dispatch = useAppDispatch();
  const countries = useAppSelector(selectAllCountries);
  const loading = useAppSelector(selectCountriesLoading);
  const error = useAppSelector(selectCountriesError);

  useEffect(() => {
    dispatch(fetchAllCountries());
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Countries of the World
      </Typography>
      <Grid container spacing={3}>
        {countries.map((country) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={country.cca3}>
            <CountryCard country={country} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
