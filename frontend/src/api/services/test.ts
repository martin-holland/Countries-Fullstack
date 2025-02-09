import { TestResponse } from '../../types/test';
import { api } from '../axios';

export const testApi = {
  getTestData: (): Promise<TestResponse> => api.get('/test/supabase'),
}; 