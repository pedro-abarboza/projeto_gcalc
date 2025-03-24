<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

/**
 * Componente para verificar permissões do usuário e renderizar conteúdo condicionalmente.
 * Suporta verificação de permissão única, todas as permissões ou qualquer uma das permissões.
 */

const props = defineProps({
    // Permissão única a ser verificada
    permission: {
        type: String,
        default: null
    },
    
    // Lista de permissões - todas são necessárias
    requiredPermissions: {
        type: Array,
        default: () => []
    },
    
    // Lista de permissões - qualquer uma é suficiente
    anyPermission: {
        type: Array,
        default: () => []
    },
    
    // Se true, o conteúdo é renderizado se o usuário NÃO tiver a permissão
    not: {
        type: Boolean,
        default: false
    }
});

const userStore = useUserStore();

// Verifica se o usuário tem as permissões necessárias
const hasPermission = computed(() => {
    // Verificar permissão única
    if (props.permission) {
        const result = userStore.hasPermission(props.permission);
        return props.not ? !result : result;
    }
    
    // Verificar todas as permissões requeridas
    if (props.requiredPermissions && props.requiredPermissions.length) {
        const result = userStore.hasAllPermissions(props.requiredPermissions);
        return props.not ? !result : result;
    }
    
    // Verificar qualquer uma das permissões
    if (props.anyPermission && props.anyPermission.length) {
        const result = userStore.hasAnyPermission(props.anyPermission);
        return props.not ? !result : result;
    }
    
    // Se não houver permissões definidas, sempre renderizar o conteúdo
    return true;
});
</script>

<template>
    <div v-if="hasPermission">
        <slot />
    </div>
</template> 