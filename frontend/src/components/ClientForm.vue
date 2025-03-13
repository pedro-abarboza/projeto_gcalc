<template>
    <Dialog 
        :visible="visible" 
        :style="{ width: '450px' }" 
        header="Detalhes do Cliente" 
        :modal="true" 
        class="p-fluid" 
        :closable="!loading"
        @hide="hideDialog"
    >
        <div class="field">
            <label for="name">Nome</label>
            <InputText 
                id="name" 
                v-model.trim="client.name" 
                required="true" 
                autofocus 
                :class="{'p-invalid': submitted && !client.name}"
                :disabled="loading" 
            />
            <small class="p-error" v-if="submitted && !client.name">Nome é obrigatório.</small>
        </div>
        <div class="field">
            <label for="email">Email</label>
            <InputText 
                id="email" 
                v-model.trim="client.email" 
                required="true" 
                :class="{'p-invalid': submitted && !client.email}"
                :disabled="loading" 
            />
            <small class="p-error" v-if="submitted && !client.email">Email é obrigatório.</small>
        </div>
        <div class="field">
            <label for="phone">Telefone</label>
            <InputText 
                id="phone" 
                v-model.trim="client.phone" 
                :disabled="loading" 
            />
        </div>
        <div class="field">
            <label for="address">Endereço</label>
            <Textarea 
                id="address" 
                v-model="client.address" 
                rows="3" 
                :disabled="loading" 
            />
        </div>
        <div class="field">
            <label for="document">Documento (CPF/CNPJ)</label>
            <InputText 
                id="document" 
                v-model.trim="client.document" 
                :disabled="loading" 
            />
        </div>

        <template #footer>
            <Button 
                label="Cancelar" 
                icon="pi pi-times" 
                class="p-button-text" 
                @click="hideDialog" 
                :disabled="loading"
            />
            <Button 
                label="Salvar" 
                icon="pi pi-check" 
                class="p-button-text" 
                @click="saveClient" 
                :loading="loading"
            />
        </template>
    </Dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { useClientStore } from '@/stores/client';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    clientData: {
        type: Object,
        default: () => ({})
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['hide', 'save']);

const clientStore = useClientStore();
const submitted = ref(false);

const client = reactive({
    id: null,
    name: '',
    email: '',
    phone: '',
    address: '',
    document: '',
    registrationDate: null
});

watch(() => props.clientData, (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
        Object.assign(client, { ...newVal });
    }
}, { deep: true });

watch(() => props.visible, (newVal) => {
    if (!newVal) {
        resetForm();
    }
});

const hideDialog = () => {
    submitted.value = false;
    emit('hide');
};

const saveClient = () => {
    submitted.value = true;

    if (client.name && client.email) {
        emit('save', { ...client });
    }
};

const resetForm = () => {
    client.id = null;
    client.name = '';
    client.email = '';
    client.phone = '';
    client.address = '';
    client.document = '';
    client.registrationDate = null;
    submitted.value = false;
};
</script>

<style scoped>
/* Estilos específicos do componente, se necessário */
</style> 