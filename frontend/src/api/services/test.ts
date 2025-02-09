import { WeatherData } from '../../types/weather';
import { api } from '../axios';

export const testApi = {
  getTestData: (): Promise<WeatherData> => api.get('/test/supabase'),
}; 