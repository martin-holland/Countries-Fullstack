import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PaymentIcon from "@mui/icons-material/Payment";
import PeopleIcon from "@mui/icons-material/People";
import PublicIcon from "@mui/icons-material/Public";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import {
  selectAllCountries,
  selectCountriesError,
  selectCountriesLoading,
} from "../../store/slices/countriesSlice";

export const CountryDetail = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const countries = useAppSelector(selectAllCountries);
  const loading = useAppSelector(selectCountriesLoading);
  const error = useAppSelector(selectCountriesError);

  const country = countries.find(
    (c) => c.name.common.toLowerCase() === decodeURIComponent(name || "")
  );

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

  if (!country) {
    return (
      <Box p={4}>
        <Typography>Country not found</Typography>
      </Box>
    );
  }

  const getCurrencies = () => {
    if (!country.currencies) return "None";
    return Object.entries(country.currencies)
      .map(
        ([code, currency]) => `${currency.name} (${currency.symbol}) [${code}]`
      )
      .join(", ");
  };

  return (
    <Box p={4}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/countries")}
        sx={{ mb: 4 }}
      >
        Back to Countries
      </Button>
      <Card>
        <CardMedia
          component="img"
          height="300"
          image={country.flags.png}
          alt={country.flags.alt || `Flag of ${country.name.common}`}
        />
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {country.name.common}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {country.name.official}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
            <PublicIcon color="action" />
            <Typography variant="body1">
              Region: {country.region}
              {country.subregion && ` (${country.subregion})`}
            </Typography>
          </Box>
          {country.capital && (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
              <LocationCityIcon color="action" />
              <Typography variant="body1">
                Capital: {country.capital.join(", ")}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
            <PeopleIcon color="action" />
            <Typography variant="body1">
              Population: {country.population.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <PaymentIcon color="action" />
            <Typography variant="body1">
              Currencies: {getCurrencies()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
