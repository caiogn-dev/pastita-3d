import { API_BASE_URL } from '../services/api';

const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || API_BASE_URL;

export const buildMediaUrl = (value) => {
  if (!value) {
    return '';
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (value.startsWith('/')) {
    return `${MEDIA_BASE_URL}${value}`;
  }
  return `${MEDIA_BASE_URL}/${value}`;
};
