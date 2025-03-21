<script setup>
import { ref, reactive, watch, computed } from 'vue';

const props = defineProps({
    client: {
        type: Object,
        required: true,
        default: () => ({
            name: '',
            document_type: 'cpf',
            document_number: '',
            email: '',
            phone: '',
            address: '',
            notes: '',
            status: true
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

const emit = defineEmits(['update:client', 'save', 'cancel']);

const documentTypes = ref([
    { value: 'cpf', label: 'CPF' },
    { value: 'cnpj', label: 'CNPJ' }
]);

// Computed para garantir que o status seja booleano
const clientStatus = computed({
    get: () => !!props.client?.status,
    set: (value) => updateClient('status', value)
});

const updateClient = (field, value) => {
    console.log(`Atualizando campo ${field} para:`, value);
    const updatedClient = { ...props.client, [field]: value };
    console.log('Cliente atualizado:', updatedClient);
    emit('update:client', updatedClient);
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const saveClient = () => {
    console.log('Salvando cliente:', props.client);
    emit('save');
};

// Função para cancelar
const cancelEdit = () => {
    console.log('Cancelando edição');
    emit('cancel');
};

// Debug para verificar o conteúdo do cliente
watch(() => props.client, (newValue) => {
    console.log('Client data changed:', newValue);
}, { deep: true });
</script>

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

<template>
    <div class="form-container">
        <div class="field">
            <label for="name">Nome *</label>
            <InputText 
                id="name" 
                :modelValue="client?.name || ''"
                @update:modelValue="value => updateClient('name', value?.trim())"
                required="true" 
                autofocus 
                :class="{'p-invalid': submitted && !client?.name}"
                :disabled="loading" 
            />
            <small class="p-error" v-if="submitted && !client?.name">Nome é obrigatório.</small>
        </div>

        <div class="field">
            <label for="document_type">Tipo de Documento *</label>
            <Dropdown
                id="document_type"
                :modelValue="client?.document_type"
                @update:modelValue="value => updateClient('document_type', value)"
                :options="documentTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o tipo"
                :class="{'p-invalid': submitted && !client?.document_type}"
                :disabled="loading"
            />
            <small class="p-error" v-if="submitted && !client?.document_type">Tipo de documento é obrigatório.</small>
        </div>

        <div class="field">
            <label for="document_number">Número do Documento *</label>
            <InputText 
                id="document_number" 
                :modelValue="client?.document_number || ''"
                @update:modelValue="value => updateClient('document_number', value?.trim())"
                required="true"
                :class="{'p-invalid': submitted && !client?.document_number}"
                :disabled="loading" 
            />
            <small class="p-error" v-if="submitted && !client?.document_number">Número do documento é obrigatório.</small>
        </div>

        <div class="field">
            <label for="email">Email *</label>
            <InputText 
                id="email" 
                :modelValue="client?.email || ''"
                @update:modelValue="value => updateClient('email', value?.trim())"
                :class="{'p-invalid': submitted && (!client.email || (client.email && !isValidEmail(client.email)))}"
                :disabled="loading" 
            />
            <small class="p-error" v-if="submitted && !client.email">Email é obrigatório.</small>
            <small class="p-error" v-if="submitted && client.email && !isValidEmail(client.email)">Email inválido.</small>
        </div>

        <div class="field">
            <label for="phone">Telefone</label>
            <InputText 
                id="phone" 
                :modelValue="client?.phone || ''"
                @update:modelValue="value => updateClient('phone', value?.trim())"
                :disabled="loading" 
            />
        </div>

        <div class="field">
            <label for="address">Endereço</label>
            <Textarea 
                id="address" 
                :modelValue="client?.address || ''"
                @update:modelValue="value => updateClient('address', value?.trim())"
                rows="3" 
                :disabled="loading" 
            />
        </div>

        <div class="field">
            <label for="notes">Observações</label>
            <Textarea 
                id="notes" 
                :modelValue="client?.notes || ''"
                @update:modelValue="value => updateClient('notes', value?.trim())"
                rows="3" 
                :disabled="loading" 
            />
        </div>

        <div class="field">
            <label for="status">Status</label>
            <div class="flex flex-wrap gap-4">
                <div class="flex gap-2">
                    <RadioButton 
                        id="status_active" 
                        name="status" 
                        :value="true" 
                        v-model="clientStatus"
                        :disabled="loading" 
                    />
                    <label for="status_active">Ativo</label>
                </div>
                <div class="flex gap-2">
                    <RadioButton 
                        id="status_inactive" 
                        name="status" 
                        :value="false" 
                        v-model="clientStatus"
                        :disabled="loading" 
                    />
                    <label for="status_inactive">Inativo</label>
                </div>
            </div>
        </div>

        <div class="actions">
            <Button 
                label="Cancelar" 
                icon="pi pi-times" 
                class="p-button-text" 
                @click="cancelEdit" 
                :disabled="loading"
            />
            <Button 
                label="Salvar" 
                icon="pi pi-check" 
                class="p-button-primary" 
                @click="saveClient" 
                :loading="loading"
            />
        </div>
    </div>
</template>