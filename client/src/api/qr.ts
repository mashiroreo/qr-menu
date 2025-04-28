import axios from './axios';

export const generateQRCode = async (storeId: string): Promise<string> => {
  const response = await axios.post<{ url: string }>('/api/qr/generate', { storeId });
  return response.data.url;
}; 