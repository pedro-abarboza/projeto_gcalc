import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guards';
import { permissionGuard } from './permission-guard';
import NotFound from '@/views/pages/NotFound.vue';
import Login from '@/views/pages/auth/Login.vue';
import Users from '@/views/pages/Usuarios.vue';
import ForbiddenPage from '@/views/pages/ForbiddenPage.vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';

const routes = [
    {
        path: '/sistema',
        component: AppLayout,
        children: [
            {
                path: '/inicio',
                name: 'dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: '/usuarios',
                name: 'usuarios',
                component: () => import('@/views/pages/Usuarios.vue'),
                meta: { 
                    requiresAuth: true,
                    permissions: ['auth.view_user', 'auth.add_user', 'auth.change_user', 'auth.delete_user'],
                    permissionType: 'any'
                }
            },
            {
                path: '/admin/funcoes',
                name: 'Funcoes',
                component: () => import('@/views/pages/Funcoes.vue'),
                meta: {
                    breadcrumb: [{ label: 'Home', to: '/' }, { label: 'Administração' }, { label: 'Funções' }],
                    pageTitle: 'Gerenciamento de Funções',
                    requiresAuth: true,
                    permissions: ['auth.view_group', 'auth.add_group', 'auth.change_group', 'auth.delete_group'],
                    permissionType: 'any'
                }
            },
            {
                path: '/servicos',
                name: 'servicos',
                component: () => import('@/views/pages/Servicos.vue'),
                meta: { 
                    requiresAuth: true,
                    permissions: ['services.view_service', 'services.add_service', 'services.change_service'],
                    permissionType: 'any'
                }
            },
            {
                path: '/clientes',
                name: 'clientes',
                component: () => import('@/views/pages/Clientes.vue'),
                meta: { 
                    requiresAuth: true,
                    permissions: ['clients.view_client', 'clients.add_client', 'clients.change_client'],
                    permissionType: 'any'
                }
            },
            {
                path: '/funcoes',
                name: 'funcoes',
                component: () => import('@/views/pages/Funcoes.vue'),
                meta: { 
                    requiresAuth: true,
                    permissions: ['auth.view_group', 'auth.add_group', 'auth.change_group', 'auth.delete_group'],
                    permissionType: 'any'
                }
            },
            {
                path: '/financeiro',
                name: 'financeiro',
                component: NotFound,
                meta: { 
                    requiresAuth: true,
                    permissions: ['financeiro.view_transaction'],
                    permissionType: 'any'
                }
            },
            {
                path: '/uikit/formlayout',
                name: 'formlayout',
                component: () => import('@/views/uikit/FormLayout.vue')
            },
            {
                path: '/uikit/input',
                name: 'input',
                component: () => import('@/views/uikit/InputDoc.vue')
            },
            {
                path: '/uikit/button',
                name: 'button',
                component: () => import('@/views/uikit/ButtonDoc.vue')
            },
            {
                path: '/uikit/table',
                name: 'table',
                component: () => import('@/views/uikit/TableDoc.vue')
            },
            {
                path: '/uikit/list',
                name: 'list',
                component: () => import('@/views/uikit/ListDoc.vue')
            },
            {
                path: '/uikit/tree',
                name: 'tree',
                component: () => import('@/views/uikit/TreeDoc.vue')
            },
            {
                path: '/uikit/panel',
                name: 'panel',
                component: () => import('@/views/uikit/PanelsDoc.vue')
            },
            {
                path: '/uikit/overlay',
                name: 'overlay',
                component: () => import('@/views/uikit/OverlayDoc.vue')
            },
            {
                path: '/uikit/media',
                name: 'media',
                component: () => import('@/views/uikit/MediaDoc.vue')
            },
            {
                path: '/uikit/message',
                name: 'message',
                component: () => import('@/views/uikit/MessagesDoc.vue')
            },
            {
                path: '/uikit/file',
                name: 'file',
                component: () => import('@/views/uikit/FileDoc.vue')
            },
            {
                path: '/uikit/menu',
                name: 'menu',
                component: () => import('@/views/uikit/MenuDoc.vue')
            },
            {
                path: '/uikit/charts',
                name: 'charts',
                component: () => import('@/views/uikit/ChartDoc.vue')
            },
            {
                path: '/uikit/misc',
                name: 'misc',
                component: () => import('@/views/uikit/MiscDoc.vue')
            },
            {
                path: '/uikit/timeline',
                name: 'timeline',
                component: () => import('@/views/uikit/TimelineDoc.vue')
            },
            {
                path: '/pages/empty',
                name: 'empty',
                component: () => import('@/views/pages/Empty.vue')
            },
            {
                path: '/pages/crud',
                name: 'crud',
                component: () => import('@/views/pages/Crud.vue')
            },
            {
                path: '/documentation',
                name: 'documentation',
                component: () => import('@/views/pages/Documentation.vue')
            },
            {
                path: '/tipos-servico',
                name: 'tipos-servico',
                component: () => import('@/views/pages/TiposServicoCliente.vue'),
                meta: {
                    requiresAuth: true,
                    permissions: ['services.view_servicetypeclient', 'services.add_servicetypeclient', 'services.change_servicetypeclient'],
                    permissionType: 'any',
                    breadcrumb: [{ label: 'Tipos de Serviço', to: '/tipos-servico' }]
                }
            },
            {
                path: '/acesso-proibido',
                name: 'forbidden',
                component: ForbiddenPage
            }
        ],
        meta: { requiresAuth: true }
    },
    {
        path: '/',
        name: 'landing',
        component: () => import('@/views/pages/Landing.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/auth/login',
        name: 'login',
        component: Login,
        meta: { requiresAuth: false }
    },
    {
        path: '/users',
        name: 'users',
        component: Users,
        meta: { requiresAuth: true }
    },
    {
        path: '/auth/access',
        name: 'accessDenied',
        component: () => import('@/views/pages/auth/Access.vue')
    },
    {
        path: '/auth/error',
        name: 'error',
        component: () => import('@/views/pages/auth/Error.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFound
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    // Verificar autenticação
    if (requiresAuth && !authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    } 
    
    // Se estiver logado e indo para o login, redirecionar para o dashboard
    if (to.path === '/auth/login' && authStore.isAuthenticated) {
        return next({ name: 'inicio' });
    }
    
    // Verificar permissões se o usuário estiver autenticado
    if (authStore.isAuthenticated) {
        // Carregar o perfil do usuário se ainda não estiver carregado
        if (!userStore.currentUser) {
            try {
                await userStore.fetchProfile();
            } catch (error) {
                console.error('Erro ao carregar perfil do usuário:', error);
                authStore.logout();
                return next({ name: 'login', query: { redirect: to.fullPath } });
            }
        }
        
        // Verificar permissões para a rota
        return permissionGuard(to, from, next);
    }
    
    next();
});

export default router;
