import { useUserStore } from '@/stores/user';

/**
 * Guarda de rota para verificar permissões antes de acessar rotas protegidas
 * @param {Object} to - Rota de destino
 * @param {Object} from - Rota de origem
 * @param {Function} next - Função para continuar a navegação
 */
export const permissionGuard = async (to, from, next) => {
    const userStore = useUserStore();
    
    // Se a rota não tem metadados de permissão, permitir o acesso
    if (!to.meta.permissions && !to.meta.requireAuth) {
        return next();
    }
    
    // Se o usuário não está logado e a rota requer autenticação, redirecionar para login
    if (to.meta.requireAuth && !userStore.currentUser) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }
    
    // Se não há permissões necessárias definidas, permitir acesso
    if (!to.meta.permissions || !to.meta.permissions.length) {
        return next();
    }
    
    // Carregar o perfil do usuário se ainda não estiver carregado
    if (!userStore.userPermissions.length && userStore.currentUser) {
        try {
            await userStore.fetchProfile();
        } catch (error) {
            console.error('Erro ao carregar perfil do usuário:', error);
            return next({ name: 'login', query: { redirect: to.fullPath } });
        }
    }
    
    const permissionType = to.meta.permissionType || 'all';
    
    // Verificar permissões com base no tipo especificado
    if (permissionType === 'all') {
        // Precisa ter todas as permissões
        if (userStore.hasAllPermissions(to.meta.permissions)) {
            return next();
        }
    } else if (permissionType === 'any') {
        // Precisa ter pelo menos uma das permissões
        if (userStore.hasAnyPermission(to.meta.permissions)) {
            return next();
        }
    }
    
    // Se chegar aqui, o usuário não tem permissão para acessar a rota
    return next({ name: 'forbidden' });
}; 