<script setup>
    import { useLayout } from '@/layout/composables/layout';
    import { useAuthStore } from '@/stores/auth';
    import { useUserStore } from '@/stores/user';
    import { useRouter } from 'vue-router';
    import { computed } from 'vue';
    import { onMounted } from 'vue';
    import AppConfigurator from './AppConfigurator.vue';
    import Logo from './AppLogo.vue';

    const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const router = useRouter();

    const currentUser = computed(() => userStore.getCurrentUser);

    // Função para realizar logout
    const handleLogout = async () => {
        try {
            await authStore.logout();
            router.push('/');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    // Aplicar tema quando o componente for montado
    onMounted(() => {
        // O tema já é aplicado no hook onMounted do useLayout
    });
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <Logo />

            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <div class="user-profile-info">
                        <span v-if="currentUser" class="user-name">{{ currentUser.username }}</span>
                    </div>
                    <router-link to="/perfil" class="layout-topbar-action">
                        <i class="pi pi-user"></i>
                        <span>Perfil</span>
                    </router-link>
                    <button type="button" class="layout-topbar-action" @click="handleLogout">
                        <i class="pi pi-sign-out"></i>
                        <span>Sair</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.user-profile-info {
    padding: 0.5rem 1rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--surface-border);
}

.user-name {
    font-weight: 600;
}
</style>
