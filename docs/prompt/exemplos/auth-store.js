import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);
  
  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.is_staff || false);
  const getUser = computed(() => user.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  
  // Actions
  const login = async (credentials) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post('/api/auth/login/', credentials);
      token.value = response.data.token;
      localStorage.setItem('token', token.value);
      
      // Configurar o token para todas as requisições futuras
      axios.defaults.headers.common['Authorization'] = `Token ${token.value}`;
      
      // Buscar informações do usuário
      await fetchUserInfo();
      
      return response.data;
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      error.value = err.response?.data?.detail || 'Credenciais inválidas';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };
  
  const logout = async () => {
    loading.value = true;
    
    try {
      if (token.value) {
        await axios.post('/api/auth/logout/', {}, {
          headers: {
            Authorization: `Token ${token.value}`
          }
        });
      }
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      // Limpar dados mesmo se houver erro na API
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      loading.value = false;
      
      // Redirecionar para a página de login
      router.push('/login');
    }
  };
  
  const fetchUserInfo = async () => {
    if (!token.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get('/api/auth/user/', {
        headers: {
          Authorization: `Token ${token.value}`
        }
      });
      
      user.value = response.data;
      return response.data;
    } catch (err) {
      console.error('Erro ao buscar informações do usuário:', err);
      error.value = err.response?.data?.detail || 'Erro ao buscar informações do usuário';
      
      // Se o token for inválido, fazer logout
      if (err.response?.status === 401) {
        await logout();
      }
      
      throw error.value;
    } finally {
      loading.value = false;
    }
  };
  
  const updateUserProfile = async (userData) => {
    if (!token.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.put(`/api/users/${user.value.id}/`, userData, {
        headers: {
          Authorization: `Token ${token.value}`
        }
      });
      
      user.value = response.data;
      return response.data;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      error.value = err.response?.data || 'Erro ao atualizar perfil';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };
  
  const changePassword = async (passwordData) => {
    if (!token.value) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post('/api/auth/password/change/', passwordData, {
        headers: {
          Authorization: `Token ${token.value}`
        }
      });
      
      return response.data;
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      error.value = err.response?.data || 'Erro ao alterar senha';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };
  
  const checkAuth = async () => {
    if (token.value && !user.value) {
      await fetchUserInfo();
    }
    return isAuthenticated.value;
  };
  
  // Inicializar
  const initialize = async () => {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Token ${token.value}`;
      await fetchUserInfo().catch(() => {
        // Se houver erro ao buscar usuário, limpar token
        token.value = null;
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      });
    }
  };
  
  return {
    // Estado
    token,
    user,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    getUser,
    isLoading,
    getError,
    
    // Actions
    login,
    logout,
    fetchUserInfo,
    updateUserProfile,
    changePassword,
    checkAuth,
    initialize
  };
}); 