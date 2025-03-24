import { useUserStore } from '@/stores/user';

/**
 * Plugin para criar e registrar diretivas relacionadas a permissões.
 * Exemplo de uso:
 * - Permissão única: v-permission="'users.add_user'"
 * - Todas as permissões: v-permission:all="['users.add_user', 'users.change_user']"
 * - Qualquer permissão: v-permission:any="['users.add_user', 'users.change_user']"
 * - Negar permissão: v-permission:not="'users.delete_user'"
 */
export const setupPermissionDirectives = (app) => {
    // Diretiva para verificação de permissões
    app.directive('permission', {
        mounted(el, binding, vnode) {
            const userStore = useUserStore();
            
            // Se o usuário não estiver logado, ocultar o elemento
            if (!userStore.currentUser) {
                el.style.display = 'none';
                return;
            }

            let hasPermission = false;
            const value = binding.value;
            const modifier = binding.modifiers;
            const arg = binding.arg;
            
            // Verificar o tipo de verificação com base no argumento
            if (arg === 'all' && Array.isArray(value)) {
                // Precisa ter todas as permissões
                hasPermission = userStore.hasAllPermissions(value);
            } else if (arg === 'any' && Array.isArray(value)) {
                // Precisa ter pelo menos uma das permissões
                hasPermission = userStore.hasAnyPermission(value);
            } else if (arg === 'not') {
                // Nega a verificação da permissão
                if (Array.isArray(value)) {
                    hasPermission = !userStore.hasAnyPermission(value);
                } else {
                    hasPermission = !userStore.hasPermission(value);
                }
            } else {
                // Verificação de permissão única
                hasPermission = userStore.hasPermission(value);
            }
            
            // Se não tiver permissão, oculta o elemento
            if (!hasPermission) {
                el.style.display = 'none';
            }
        },
        
        // Atualiza quando o componente é revalidado
        updated(el, binding, vnode) {
            const userStore = useUserStore();
            
            // Se o usuário não estiver logado, ocultar o elemento
            if (!userStore.currentUser) {
                el.style.display = 'none';
                return;
            }

            let hasPermission = false;
            const value = binding.value;
            const modifier = binding.modifiers;
            const arg = binding.arg;
            
            // Verificar o tipo de verificação com base no argumento
            if (arg === 'all' && Array.isArray(value)) {
                // Precisa ter todas as permissões
                hasPermission = userStore.hasAllPermissions(value);
            } else if (arg === 'any' && Array.isArray(value)) {
                // Precisa ter pelo menos uma das permissões
                hasPermission = userStore.hasAnyPermission(value);
            } else if (arg === 'not') {
                // Nega a verificação da permissão
                if (Array.isArray(value)) {
                    hasPermission = !userStore.hasAnyPermission(value);
                } else {
                    hasPermission = !userStore.hasPermission(value);
                }
            } else {
                // Verificação de permissão única
                hasPermission = userStore.hasPermission(value);
            }
            
            // Se não tiver permissão, oculta o elemento; caso contrário, exibe-o
            el.style.display = hasPermission ? '' : 'none';
        }
    });
    
    return app;
}; 