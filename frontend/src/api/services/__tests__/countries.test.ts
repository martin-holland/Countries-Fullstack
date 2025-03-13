import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Country } from '../../../types/country';
import { api } from '../../axios';
import { countriesApi } from '../countries';

// Define the type for the mocked API function
type MockedApiFunction<T> = ReturnType<typeof vi.fn> & {
  mockResolvedValue: (value: T) => void;
  mockRejectedValue: (error: Error) => void;
};

// Mock the axios instance
vi.mock('../../axios', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('Countries API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getAllCountries calls the correct endpoint', async () => {
    // Mock the API response with a minimal country object
    const mockResponse = [{ 
      name: { 
        common: 'Finland',
        official: 'Republic of Finland'
      },
      capital: ['Helsinki'],
      region: 'Europe',
      population: 5530719,
      flags: {
        png: 'https://flagcdn.com/w320/fi.png',
        svg: 'https://flagcdn.com/fi.svg'
      },
      cca3: 'FIN'
    }];
    
    (api.get as MockedApiFunction<Country[]>).mockResolvedValue(mockResponse as Country[]);

    // Call the API function
    const result = await countriesApi.getAllCountries();

    // Check if the API was called with the correct URL
    expect(api.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/all');
    
    // Check if the result is correct
    expect(result).toEqual(mockResponse);
  });

  test('getCountryByCode calls the correct endpoint', async () => {
    // Mock the API response with a minimal country object
    const mockResponse = { 
      name: { 
        common: 'Finland',
        official: 'Republic of Finland'
      },
      capital: ['Helsinki'],
      region: 'Europe',
      population: 5530719,
      flags: {
        png: 'https://flagcdn.com/w320/fi.png',
        svg: 'https://flagcdn.com/fi.svg'
      },
      cca3: 'FIN'
    };
    
    (api.get as MockedApiFunction<Country>).mockResolvedValue(mockResponse as Country);

    // Call the API function
    const result = await countriesApi.getCountryByCode('FIN');

    // Check if the API was called with the correct URL
    expect(api.get).toHaveBeenCalledWith('https://restcountries.com/v3.1/alpha/FIN');
    
    // Check if the result is correct
    expect(result).toEqual(mockResponse);
  });

  test('handles API errors', async () => {
    // Mock the API error
    const mockError = new Error('API Error');
    (api.get as MockedApiFunction<never>).mockRejectedValue(mockError);

    // Call the API function and expect it to throw an error
    await expect(countriesApi.getAllCountries()).rejects.toThrow('API Error');
  });
}); 