import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8050/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Erro na requisição:', error);
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Se não houver resposta, retornar o erro
        if (!error.response) {
            console.error('Erro de rede ou servidor não disponível:', error);
            return Promise.reject(error);
        }

        // Se o erro for 401 e não for uma tentativa de refresh
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                
                // Se não houver refresh token, redirecionar para o login
                if (!refreshToken) {
                    localStorage.removeItem('token');
                    window.location.href = '/auth/login';
                    return Promise.reject(error);
                }
                
                const response = await axios.post('http://localhost:8050/api/token/refresh/', {
                    refresh: refreshToken
                });

                const { access } = response.data;
                localStorage.setItem('token', access);

                originalRequest.headers.Authorization = `Bearer ${access}`;
                return api(originalRequest);
            } catch (err) {
                console.error('Erro ao renovar token:', err);
                // Se o refresh falhar, redireciona para o login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/auth/login';
                return Promise.reject(err);
            }
        }

        // Log de erros para depuração
        if (error.response) {
            console.error(`Erro ${error.response.status}:`, error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api; 