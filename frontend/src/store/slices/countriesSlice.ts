import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { countriesApi } from '../../api/services/countries';
import { CountryState } from '../../types/country';
import type { RootState } from '../store';

const initialState: CountryState = {
  countries: [],
  loading: false,
  error: null,
  selectedCountry: null,
};

export const fetchAllCountries = createAsyncThunk('countries/fetchAll', async () => {
    const response = await countriesApi.getAllCountries();
    return response;
});

export const fetchCountryByCode = createAsyncThunk('countries/fetchByCode', async (code: string) => {
    const response = await countriesApi.getCountryByCode(code);
    return response;
});



// export const fetchCountryByCode = createAsyncThunk<
//   Country,
//   string,
//   { rejectValue: string }
// >('countries/fetchByCode', async (code, { rejectWithValue }) => {
//   try {
//     const response = await countriesApi.getCountryByCode(code);
//     return response.data[0];
//   } catch (err) {
//     console.log(err);
//     return rejectWithValue('Failed to fetch country');
//   }
// });

const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    clearSelectedCountry: (state) => {
      state.selectedCountry = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all countries
      .addCase(fetchAllCountries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCountries.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
      })
      .addCase(fetchAllCountries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      })
      // Fetch single country
      .addCase(fetchCountryByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCountryByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCountry = action.payload;
      })
      .addCase(fetchCountryByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'An error occurred';
      });
  },
});

// Selectors
export const selectAllCountries = (state: RootState) => state.countries.countries;
export const selectCountriesLoading = (state: RootState) => state.countries.loading;
export const selectCountriesError = (state: RootState) => state.countries.error;
export const selectSelectedCountry = (state: RootState) => state.countries.selectedCountry;

export const { clearSelectedCountry } = countriesSlice.actions;
export default countriesSlice.reducer; 