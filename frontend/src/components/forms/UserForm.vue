<script setup>
import { ref } from 'vue';

const props = defineProps({
    user: {
        type: Object,
        required: true,
        default: () => ({
            name: '',
            email: '',
            role: 'Analista',
            status: 'Ativo'
        })
    },
    submitted: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:user', 'save', 'cancel']);

const roles = ref(['Administrador', 'Analista', 'Revisor']);
const statuses = ref(['Ativo', 'Inativo']);

const updateUser = (field, value) => {
    const updatedUser = { ...props.user, [field]: value };
    emit('update:user', updatedUser);
};
</script>

<template>
    <div class="form-container">
        <div class="field">
            <label for="name">Nome</label>
            <InputText 
                id="name" 
                :modelValue="user?.name || ''"
                @update:modelValue="value => updateUser('name', value?.trim())"
                required="true" 
                autofocus 
                :class="{ 'p-invalid': submitted && !user?.name }" 
            />
            <small class="p-invalid" v-if="submitted && !user?.name">Nome é obrigatório.</small>
        </div>
        <div class="field">
            <label for="email">E-mail</label>
            <InputText 
                id="email" 
                :modelValue="user?.email || ''"
                @update:modelValue="value => updateUser('email', value?.trim())"
                required="true" 
                :class="{ 'p-invalid': submitted && !user?.email }" 
            />
            <small class="p-invalid" v-if="submitted && !user?.email">E-mail é obrigatório.</small>
        </div>
        <div class="field">
            <label for="role">Função</label>
            <Dropdown 
                id="role" 
                :modelValue="user?.role"
                @update:modelValue="value => updateUser('role', value)"
                :options="roles" 
                placeholder="Selecione uma função"
                class="w-full"
            />
        </div>
        <div class="field">
            <label for="status">Status</label>
            <Dropdown 
                id="status" 
                :modelValue="user?.status"
                @update:modelValue="value => updateUser('status', value)"
                :options="statuses" 
                placeholder="Selecione um status"
                class="w-full"
            />
        </div>
        <div class="actions">
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="$emit('cancel')" />
            <Button label="Salvar" icon="pi pi-check" class="p-button-icon" @click="$emit('save')" />
        </div>
    </div>
</template>

<style scoped>
.form-container {
    padding: 1rem;
}

.field {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 2rem;
}
</style> 