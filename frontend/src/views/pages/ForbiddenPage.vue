<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
    router.back();
};

const goHome = () => {
    router.push({ name: 'dashboard' });
};
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%);">
                <div class="w-full surface-card py-8 px-5 sm:px-8 flex flex-column align-items-center" style="border-radius: 53px;">
                    <div class="flex justify-content-center align-items-center bg-pink-500 border-circle" style="height: 3.2rem; width: 3.2rem;">
                        <i class="pi pi-ban text-white text-3xl"></i>
                    </div>
                    <h1 class="text-900 font-bold text-5xl mb-2">Acesso Proibido</h1>
                    <div class="text-600 mb-5">Você não tem permissão para acessar este recurso.</div>
                    <div class="flex flex-wrap gap-2">
                        <Button label="Voltar" icon="pi pi-arrow-left" class="p-button-outlined" @click="goBack"></Button>
                        <Button label="Página Inicial" icon="pi pi-home" @click="goHome"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template> 