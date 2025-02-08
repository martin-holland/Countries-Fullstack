import { Country } from '../../types/country';
import { api } from '../axios';

export const countriesApi = {
  getAllCountries: () => 
    api.get<Country[]>('https://restcountries.com/v3.1/all'),
    
  getCountryByCode: (code: string) =>
    api.get<Country[]>(`https://restcountries.com/v3.1/alpha/${code}`),
}; 