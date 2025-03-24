<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/inicio' }]
    },
    {
        label: 'Acessos',
        permissions: ['auth.view_user', 'auth.view_group'],
        permissionType: 'any',
        items: [
            { 
                label: 'Usuários', 
                icon: 'pi pi-fw pi-users', 
                to: '/usuarios',
                permissions: ['auth.view_user', 'auth.add_user', 'auth.change_user', 'auth.delete_user'],
                permissionType: 'any'
            },
            { 
                label: 'Funções', 
                icon: 'pi pi-fw pi-key', 
                to: '/funcoes',
                permissions: ['auth.view_group', 'auth.add_group', 'auth.change_group', 'auth.delete_group'],
                permissionType: 'any'
            },
        ]
    },
    {
        label: 'Gestão',
        permissions: ['clients.view_client', 'services.view_service', 'services.view_servicetypeclient'],
        permissionType: 'any',
        items: [
            { 
                label: 'Clientes', 
                icon: 'pi pi-fw pi-building', 
                to: '/clientes',
                permissions: ['clients.view_client', 'clients.add_client', 'clients.change_client'],
                permissionType: 'any'
            },
            { 
                label: 'Serviços', 
                icon: 'pi pi-fw pi-briefcase', 
                to: '/servicos',
                permissions: ['services.view_service', 'services.add_service', 'services.change_service'],
                permissionType: 'any'
            },
            { 
                label: 'Tipos de Serviço', 
                icon: 'pi pi-fw pi-list', 
                to: '/tipos-servico',
                permissions: ['services.view_servicetypeclient', 'services.add_servicetypeclient', 'services.change_servicetypeclient'],
                permissionType: 'any'
            }
        ]
    },
    {
        label: 'Financeiro',
        permissions: ['financeiro.view_transaction'],
        permissionType: 'any',
        items: [
            { 
                label: 'Faturamento', 
                icon: 'pi pi-fw pi-dollar', 
                to: '/financeiro',
                permissions: ['financeiro.view_transaction'],
                permissionType: 'any'
            }
        ]
    },
    {
        label: 'UI Components',
        dev: true, // Apenas para desenvolvimento
        items: [
            { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', to: '/uikit/formlayout', dev: true },
            { label: 'Input', icon: 'pi pi-fw pi-check-square', to: '/uikit/input', dev: true },
            { label: 'Button', icon: 'pi pi-fw pi-mobile', to: '/uikit/button', class: 'rotated-icon', dev: true },
            { label: 'Table', icon: 'pi pi-fw pi-table', to: '/uikit/table', dev: true },
            { label: 'List', icon: 'pi pi-fw pi-list', to: '/uikit/list', dev: true },
            { label: 'Tree', icon: 'pi pi-fw pi-share-alt', to: '/uikit/tree', dev: true },
            { label: 'Panel', icon: 'pi pi-fw pi-tablet', to: '/uikit/panel', dev: true },
            { label: 'Overlay', icon: 'pi pi-fw pi-clone', to: '/uikit/overlay', dev: true },
            { label: 'Media', icon: 'pi pi-fw pi-image', to: '/uikit/media', dev: true },
            { label: 'Menu', icon: 'pi pi-fw pi-bars', to: '/uikit/menu', dev: true },
            { label: 'Message', icon: 'pi pi-fw pi-comment', to: '/uikit/message', dev: true },
            { label: 'File', icon: 'pi pi-fw pi-file', to: '/uikit/file', dev: true },
            { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', to: '/uikit/charts', dev: true },
            { label: 'Timeline', icon: 'pi pi-fw pi-calendar', to: '/uikit/timeline', dev: true },
            { label: 'Misc', icon: 'pi pi-fw pi-circle', to: '/uikit/misc', dev: true }
        ]
    },
    {
        label: 'Pages',
        dev: true, // Apenas para desenvolvimento
        icon: 'pi pi-fw pi-briefcase',
        to: '/pages',
        items: [
            {
                label: 'Landing',
                icon: 'pi pi-fw pi-globe',
                to: '/landing',
                dev: true
            },
            {
                label: 'Auth',
                icon: 'pi pi-fw pi-user',
                dev: true,
                items: [
                    {
                        label: 'Login',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/auth/login',
                        dev: true
                    },
                    {
                        label: 'Error',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/auth/error',
                        dev: true
                    },
                    {
                        label: 'Access Denied',
                        icon: 'pi pi-fw pi-lock',
                        to: '/auth/access',
                        dev: true
                    }
                ]
            },
            {
                label: 'Crud',
                icon: 'pi pi-fw pi-pencil',
                to: '/pages/crud',
                dev: true
            },
            {
                label: 'Not Found',
                icon: 'pi pi-fw pi-exclamation-circle',
                to: '/pages/notfound',
                dev: true
            },
            {
                label: 'Empty',
                icon: 'pi pi-fw pi-circle-off',
                to: '/pages/empty',
                dev: true
            }
        ]
    },
    {
        label: 'Hierarchy',
        items: [
            {
                label: 'Submenu 1',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'Submenu 1.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: 'Submenu 1.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            },
            {
                label: 'Submenu 2',
                icon: 'pi pi-fw pi-bookmark',
                items: [
                    {
                        label: 'Submenu 2.1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                            { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                        ]
                    },
                    {
                        label: 'Submenu 2.2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                    }
                ]
            }
        ]
    },
    {
        label: 'Get Started',
        dev: true, // Apenas para desenvolvimento
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-book',
                to: '/documentation',
                dev: true
            },
            {
                label: 'View Source',
                icon: 'pi pi-fw pi-github',
                url: 'https://github.com/primefaces/sakai-vue',
                target: '_blank',
                dev: true
            }
        ]
    },
    {
        label: 'Administração',
        items: [
            { label: 'Usuários', icon: 'pi pi-users', to: '/admin/usuarios' },
            { label: 'Funções', icon: 'pi pi-key', to: '/admin/funcoes' },
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
