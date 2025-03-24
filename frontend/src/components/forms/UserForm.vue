<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoleStore } from '@/stores/role';

const props = defineProps({
    user: {
        type: Object,
        required: true,
        default: () => ({
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            group_ids: [],
            is_active: true,
            password: '',
            password2: ''
        })
    },
    submitted: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:user', 'save', 'cancel']);
const roleStore = useRoleStore();

const roles = ref([]);
const rolesLoading = ref(false);

// Buscar funções disponíveis
const fetchRoles = async () => {
    rolesLoading.value = true;
    try {
        await roleStore.fetchRoles({ page_size: 100 });
        roles.value = roleStore.getRoles || [];
        console.log('Funções disponíveis:', roles.value);
    } catch (error) {
        console.error('Erro ao buscar funções:', error);
    } finally {
        rolesLoading.value = false;
    }
};

// Computed para garantir que o status seja booleano
const userIsActive = computed({
    get: () => !!props.user?.is_active,
    set: (value) => updateUser('is_active', value)
});

const updateUser = (field, value) => {
    console.log(`Atualizando campo ${field} para:`, value);
    const updatedUser = { ...props.user, [field]: value };
    console.log('Usuário atualizado:', updatedUser);
    emit('update:user', updatedUser);
};

// Função para salvar o usuário
const saveUser = () => {
    console.log('Salvando usuário:', props.user);
    emit('save');
};

// Função para cancelar
const cancelEdit = () => {
    console.log('Cancelando edição');
    emit('cancel');
};

// Debug para verificar o conteúdo do usuário
watch(() => props.user, (newValue) => {
    console.log('User data changed:', newValue);
}, { deep: true });

// Buscar funções ao montar o componente
onMounted(async () => {
    await fetchRoles();
});
</script>

<template>
    <div class="form-container">
        <div class="field">
            <label for="username">Nome de Usuário</label>
            <InputText 
                id="username" 
                :modelValue="user?.username || ''"
                @update:modelValue="value => updateUser('username', value?.trim())"
                required="true" 
                autofocus 
                :class="{ 'p-invalid': submitted && !user?.username }" 
                :disabled="loading"
            />
            <small class="p-invalid" v-if="submitted && !user?.username">Nome de usuário é obrigatório.</small>
        </div>
        <div class="field">
            <label for="email">E-mail</label>
            <InputText 
                id="email" 
                :modelValue="user?.email || ''"
                @update:modelValue="value => updateUser('email', value?.trim())"
                required="true" 
                :class="{ 'p-invalid': submitted && !user?.email }" 
                :disabled="loading"
            />
            <small class="p-invalid" v-if="submitted && !user?.email">E-mail é obrigatório.</small>
        </div>
        <div class="field">
            <label for="first_name">Nome</label>
            <InputText 
                id="first_name" 
                :modelValue="user?.first_name || ''"
                @update:modelValue="value => updateUser('first_name', value?.trim())"
                required="true" 
                :class="{ 'p-invalid': submitted && !user?.first_name }" 
                :disabled="loading"
            />
            <small class="p-invalid" v-if="submitted && !user?.first_name">Nome é obrigatório.</small>
        </div>
        <div class="field">
            <label for="last_name">Sobrenome</label>
            <InputText 
                id="last_name" 
                :modelValue="user?.last_name || ''"
                @update:modelValue="value => updateUser('last_name', value?.trim())"
                required="true" 
                :class="{ 'p-invalid': submitted && !user?.last_name }" 
                :disabled="loading"
            />
            <small class="p-invalid" v-if="submitted && !user?.last_name">Sobrenome é obrigatório.</small>
        </div>
        <div class="field" v-if="!user?.id">
            <label for="password">Senha</label>
            <Password 
                id="password" 
                :modelValue="user?.password || ''"
                @update:modelValue="value => updateUser('password', value)"
                required="true" 
                :class="{ 'p-invalid': submitted && !user?.password }" 
                :disabled="loading"
                toggleMask
            />
            <small class="p-invalid" v-if="submitted && !user?.password">Senha é obrigatória.</small>
        </div>
        <div class="field" v-if="!user?.id">
            <label for="password2">Confirmar Senha</label>
            <Password 
                id="password2" 
                :modelValue="user?.password2 || ''"
                @update:modelValue="value => updateUser('password2', value)"
                required="true" 
                :class="{ 'p-invalid': submitted && !user?.password2 }" 
                :disabled="loading"
                toggleMask
            />
            <small class="p-invalid" v-if="submitted && !user?.password2">Confirmação de senha é obrigatória.</small>
            <small class="p-invalid" v-if="submitted && user?.password && user?.password2 && user?.password !== user?.password2">As senhas não conferem.</small>
        </div>
        <div class="field">
            <label for="group_ids">Funções</label>
            <MultiSelect 
                id="group_ids" 
                :modelValue="user?.group_ids || []"
                @update:modelValue="value => updateUser('group_ids', value)"
                :options="roles" 
                optionLabel="name"
                optionValue="id"
                placeholder="Selecione as funções"
                class="w-full"
                :disabled="loading || rolesLoading"
                :loading="rolesLoading"
                display="chip"
                filter
            />
        </div>
        <div class="field">
            <label for="is_active">Status</label>
            <div class="flex flex-wrap gap-4">
                <div class="flex gap-2">
                    <RadioButton 
                        id="is_active_true" 
                        name="is_active" 
                        :value="true" 
                        v-model="userIsActive"
                        :disabled="loading" 
                    />
                    <label for="is_active_true">Ativo</label>
                </div>
                <div class="flex gap-2">
                    <RadioButton 
                        id="is_active_false" 
                        name="is_active" 
                        :value="false" 
                        v-model="userIsActive"
                        :disabled="loading" 
                    />
                    <label for="is_active_false">Inativo</label>
                </div>
            </div>
        </div>
        <div class="actions">
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cancelEdit" :disabled="loading" />
            <Button label="Salvar" icon="pi pi-check" class="p-button-primary" @click="saveUser" :loading="loading" />
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