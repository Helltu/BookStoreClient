import axios from './axios';

export const login = async (credentials) => {
    const response = await axios.get('/general/login', {
        params: {
            email: credentials.email,
            password: credentials.password,
        },
    });
    return response.data;
};

export const register = async (credentials) => {
    const response = await axios.post('/general/register', credentials);
    return response.data;
};
