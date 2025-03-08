import axios from 'axios';

const baseURL = 'http://130.211.241.123:5678/webhook-test';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: false,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;