import AirIcon from "@mui/icons-material/Air";
import OpacityIcon from "@mui/icons-material/Opacity";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";
import { WeatherData } from "../../types/weather";

interface WeatherInfoProps {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export const WeatherInfo = ({
  weatherData,
  loading,
  error,
}: WeatherInfoProps) => {
  if (loading) {
    return <CircularProgress size={20} />;
  }

  if (error || !weatherData) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Current Weather
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
            style={{ width: 50, height: 50 }}
          />
          <Typography>
            {weatherData.weather[0].main} - {weatherData.weather[0].description}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ThermostatIcon color="action" />
          <Typography>
            Temperature: {Math.round(weatherData.main.temp)}°C (Feels like{" "}
            {Math.round(weatherData.main.feels_like)}°C)
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <OpacityIcon color="action" />
          <Typography>Humidity: {weatherData.main.humidity}%</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AirIcon color="action" />
          <Typography>
            Wind Speed: {Math.round(weatherData.wind.speed * 3.6)} km/h
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
