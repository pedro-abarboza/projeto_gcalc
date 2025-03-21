<script setup>
import { onMounted } from 'vue';

// Função para carregar as configurações do localStorage
const loadLayoutConfig = () => {
    try {
        const savedConfig = localStorage.getItem('layoutConfig');
        if (savedConfig) {
            return JSON.parse(savedConfig);
        }
    } catch (error) {
        console.error('Erro ao carregar configurações do layout:', error);
    }
    
    // Configurações padrão
    return {
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: false,
        menuMode: 'static'
    };
};

// Aplicar tema escuro se estiver configurado
onMounted(() => {
    const config = loadLayoutConfig();
    if (config.darkTheme) {
        document.documentElement.classList.add('app-dark');
    } else {
        document.documentElement.classList.remove('app-dark');
    }
});
</script>

<template>
    <router-view></router-view>
</template>

<style scoped>
    .card {
        background: var(--surface-card);
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 1rem;
    }

    .field {
        margin-bottom: 1.5rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
    }

    .p-button {
        margin-right: 0.5rem;
    }

    .p-dialog .p-dialog-content {
        padding: 2rem;
    }

    .p-dialog .p-dialog-footer {
        padding: 1.5rem;
    }

    .cursor-pointer {
        cursor: pointer;
    }
</style>
