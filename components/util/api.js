import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://dev-api.zyod.com/v1';

export const fetchWithToken = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('userToken');
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  const data = await response.json();
  return data;
}; 