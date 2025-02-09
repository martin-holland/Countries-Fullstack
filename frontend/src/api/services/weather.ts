import { api } from '../axios';

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export const weatherApi = {
  getWeatherByCity: (city: string) =>
    api.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${WEATHER_API_KEY}`
    ),
}; 