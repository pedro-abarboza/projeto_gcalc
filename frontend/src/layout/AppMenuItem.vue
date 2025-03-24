<script setup>
    import { useLayout } from '@/layout/composables/layout';
    import { useUserStore } from '@/stores/user';
    import { onBeforeMount, ref, watch, computed } from 'vue';
    import { useRoute } from 'vue-router';

    const route = useRoute();
    const userStore = useUserStore();

    const { layoutState, setActiveMenuItem, toggleMenu } = useLayout();

    const props = defineProps({
        item: {
            type: Object,
            default: () => ({})
        },
        index: {
            type: Number,
            default: 0
        },
        root: {
            type: Boolean,
            default: true
        },
        parentItemKey: {
            type: String,
            default: null
        }
    });

    const isActiveMenu = ref(false);
    const itemKey = ref(null);

    // Função para verificar permissões de um item
    const hasPermission = (item) => {
        // Se o item não tem permissões definidas, mostrar sempre
        if (!item.permissions || !item.permissions.length) {
            return true;
        }
        
        // Se estamos em modo de desenvolvimento e o item tem a flag dev, mostrar sempre
        if (process.env.NODE_ENV === 'development' && item.dev) {
            return true;
        }
        
        // Se não há usuário logado, não mostrar itens com permissão
        if (!userStore.currentUser) {
            return false;
        }
        
        // Verificar permissões com base no tipo de permissão
        const permissionType = item.permissionType || 'all';
        
        if (permissionType === 'all') {
            return userStore.hasAllPermissions(item.permissions);
        } else if (permissionType === 'any') {
            return userStore.hasAnyPermission(item.permissions);
        }
        
        return false;
    };

    // Verifica se o item deve ser visível
    const isVisible = computed(() => {
        // Verificar permissões do item
        if (!hasPermission(props.item)) {
            return false;
        }
        
        // Se o item tem subitens, verificar se pelo menos um subitem tem permissão
        if (props.item.items && props.item.items.length) {
            return props.item.items.some(subItem => hasPermission(subItem));
        }
        
        return props.item.visible !== false;
    });

    onBeforeMount(() => {
        itemKey.value = props.parentItemKey ? props.parentItemKey + '-' + props.index : String(props.index);

        const activeItem = layoutState.activeMenuItem;

        isActiveMenu.value = activeItem === itemKey.value || activeItem ? activeItem.startsWith(itemKey.value + '-') : false;
    });

    watch(
        () => layoutState.activeMenuItem,
        (newVal) => {
            isActiveMenu.value = newVal === itemKey.value || newVal.startsWith(itemKey.value + '-');
        }
    );

    function itemClick(event, item) {
        if (item.disabled) {
            event.preventDefault();
            return;
        }

        if ((item.to || item.url) && (layoutState.staticMenuMobileActive || layoutState.overlayMenuActive)) {
            toggleMenu();
        }

        if (item.command) {
            item.command({ originalEvent: event, item: item });
        }

        const foundItemKey = item.items ? (isActiveMenu.value ? props.parentItemKey : itemKey) : itemKey.value;

        setActiveMenuItem(foundItemKey);
    }

    function checkActiveRoute(item) {
        return route.path === item.to;
    }

    // Filtra os subitens baseados nas permissões
    const filteredItems = computed(() => {
        if (!props.item.items) return [];
        return props.item.items.filter(subItem => hasPermission(subItem));
    });
</script>

<template>
    <li v-if="isVisible" :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActiveMenu }">
        <div v-if="root" class="layout-menuitem-root-text">{{ item.label }}</div>
        <a v-if="(!item.to || item.items) && item.visible !== false" :href="item.url" @click="itemClick($event, item, index)" :class="item.class" :target="item.target" tabindex="0">
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items && filteredItems.length > 0"></i>
        </a>
        <router-link v-if="item.to && !item.items && item.visible !== false" @click="itemClick($event, item, index)" :class="[item.class, { 'active-route': checkActiveRoute(item) }]" tabindex="0" :to="item.to">
            <i :class="item.icon" class="layout-menuitem-icon"></i>
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i class="pi pi-fw pi-angle-down layout-submenu-toggler" v-if="item.items && filteredItems.length > 0"></i>
        </router-link>
        <Transition v-if="item.items && filteredItems.length > 0 && item.visible !== false" name="layout-submenu">
            <ul v-show="root ? true : isActiveMenu" class="layout-submenu">
                <app-menu-item v-for="(child, i) in filteredItems" :key="child" :index="i" :item="child" :parentItemKey="itemKey" :root="false"></app-menu-item>
            </ul>
        </Transition>
    </li>
</template>

<style lang="scss" scoped></style>
