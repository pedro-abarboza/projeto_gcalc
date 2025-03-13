<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        :style="{ width: '450px' }"
        :header="serviceData.id ? 'Editar Serviço' : 'Novo Serviço'"
        :modal="true"
        class="p-fluid"
    >
        <div class="field">
            <label for="client">Cliente</label>
            <Dropdown
                id="client"
                v-model="serviceData.client"
                :options="clients"
                optionLabel="name"
                placeholder="Selecione um Cliente"
                :class="{ 'p-invalid': submitted && !serviceData.client }"
            />
            <small class="p-error" v-if="submitted && !serviceData.client">Cliente é obrigatório.</small>
        </div>

        <div class="field">
            <label for="calculation_type">Tipo de Cálculo</label>
            <Dropdown
                id="calculation_type"
                v-model="serviceData.calculation_type"
                :options="calculationTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o Tipo"
                :class="{ 'p-invalid': submitted && !serviceData.calculation_type }"
            />
            <small class="p-error" v-if="submitted && !serviceData.calculation_type">Tipo de cálculo é obrigatório.</small>
        </div>

        <div class="field">
            <label for="description">Descrição</label>
            <Textarea
                id="description"
                v-model="serviceData.description"
                required="true"
                rows="3"
                :class="{ 'p-invalid': submitted && !serviceData.description }"
            />
            <small class="p-error" v-if="submitted && !serviceData.description">Descrição é obrigatória.</small>
        </div>

        <div class="field">
            <label for="deadline">Prazo</label>
            <Calendar
                id="deadline"
                v-model="serviceData.deadline"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                :class="{ 'p-invalid': submitted && !serviceData.deadline }"
            />
            <small class="p-error" v-if="submitted && !serviceData.deadline">Prazo é obrigatório.</small>
        </div>

        <div class="field">
            <label for="status">Status</label>
            <Dropdown
                id="status"
                v-model="serviceData.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o Status"
                :class="{ 'p-invalid': submitted && !serviceData.status }"
            />
            <small class="p-error" v-if="submitted && !serviceData.status">Status é obrigatório.</small>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Salvar" icon="pi pi-check" class="p-button-text" @click="saveService" />
        </template>
    </Dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    service: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['update:visible', 'save']);

const submitted = ref(false);
const clients = ref([]);
const serviceData = ref({ ...props.service });

const calculationTypes = ref([
    { label: 'Trabalhista', value: 'labor' },
    { label: 'Previdenciário', value: 'social_security' },
    { label: 'FGTS', value: 'fgts' }
]);

const statusOptions = ref([
    { label: 'Pendente', value: 'pending' },
    { label: 'Em Andamento', value: 'in_progress' },
    { label: 'Em Revisão', value: 'review' },
    { label: 'Concluído', value: 'completed' },
    { label: 'Cancelado', value: 'cancelled' }
]);

// Atualiza serviceData quando a prop service mudar
watch(() => props.service, (newService) => {
    serviceData.value = { ...newService };
}, { deep: true });

const hideDialog = () => {
    emit('update:visible', false);
    submitted.value = false;
};

const saveService = () => {
    submitted.value = true;

    if (serviceData.value.client && 
        serviceData.value.calculation_type && 
        serviceData.value.description && 
        serviceData.value.deadline && 
        serviceData.value.status) {
        emit('save', serviceData.value);
        hideDialog();
    }
};

// Carregar lista de clientes quando o componente for montado
onMounted(async () => {
    try {
        // TODO: Implementar chamada à API para buscar clientes
        // const response = await clientService.getClients();
        // clients.value = response;
        
        // Mock de clientes para teste
        clients.value = [
            { id: 1, name: 'Cliente 1' },
            { id: 2, name: 'Cliente 2' },
            { id: 3, name: 'Cliente 3' }
        ];
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
    }
});
</script>

<style scoped>
.field {
    margin-bottom: 1.5rem;
}
</style> 