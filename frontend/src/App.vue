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

<style scoped></style>
