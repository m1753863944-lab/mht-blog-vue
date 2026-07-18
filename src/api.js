import axios from 'axios';

const isProd = import.meta.env.PROD;
const apiBaseURL = isProd 
  ? 'https://mht-blog-service.onrender.com' 
  : 'http://localhost:8080';

  
const myApi = axios.create({
  baseURL: 'https://mht-blog-service.onrender.com',
  timeout: 10000
});

export default myApi;
