const axios = require('axios');
const API_KEY = '30739552-0c064bc595ee99672668e6526';
const BASE_URL = 'https://pixabay.com/api/';

export const getPhotos = async (searchQuery, page) => {
  const response = await axios.get(
    `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
  );
  return response.data;
};