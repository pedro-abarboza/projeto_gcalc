<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        :style="{ width: '600px' }"
        :header="calculationData.id ? 'Editar Cálculo' : 'Novo Cálculo'"
        :modal="true"
        class="p-fluid"
    >
        <div class="grid">
            <div class="col-12">
                <div class="field">
                    <label for="service">Serviço</label>
                    <Dropdown
                        id="service"
                        v-model="calculationData.service"
                        :options="services"
                        optionLabel="id"
                        placeholder="Selecione um Serviço"
                        :class="{ 'p-invalid': submitted && !calculationData.service }"
                        :disabled="loading || calculationData.id"
                    />
                    <small class="p-error" v-if="submitted && !calculationData.service">Serviço é obrigatório.</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="calculation_type">Tipo de Cálculo</label>
                    <Dropdown
                        id="calculation_type"
                        v-model="calculationData.calculation_type"
                        :options="calculationTypes"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o Tipo"
                        :class="{ 'p-invalid': submitted && !calculationData.calculation_type }"
                        :disabled="loading || calculationData.id"
                    />
                    <small class="p-error" v-if="submitted && !calculationData.calculation_type">Tipo de cálculo é obrigatório.</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="status">Status</label>
                    <Dropdown
                        id="status"
                        v-model="calculationData.status"
                        :options="statusOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o Status"
                        :class="{ 'p-invalid': submitted && !calculationData.status }"
                        :disabled="loading"
                    />
                    <small class="p-error" v-if="submitted && !calculationData.status">Status é obrigatório.</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="start_date">Data Inicial</label>
                    <Calendar
                        id="start_date"
                        v-model="calculationData.start_date"
                        dateFormat="dd/mm/yy"
                        :showIcon="true"
                        :class="{ 'p-invalid': submitted && !calculationData.start_date }"
                        :disabled="loading"
                    />
                    <small class="p-error" v-if="submitted && !calculationData.start_date">Data inicial é obrigatória.</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="end_date">Data Final</label>
                    <Calendar
                        id="end_date"
                        v-model="calculationData.end_date"
                        dateFormat="dd/mm/yy"
                        :showIcon="true"
                        :class="{ 'p-invalid': submitted && !calculationData.end_date }"
                        :disabled="loading"
                    />
                    <small class="p-error" v-if="submitted && !calculationData.end_date">Data final é obrigatória.</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="base_salary">Salário Base</label>
                    <InputNumber
                        id="base_salary"
                        v-model="calculationData.base_salary"
                        mode="currency"
                        currency="BRL"
                        locale="pt-BR"
                        :minFractionDigits="2"
                        :class="{ 'p-invalid': submitted && !calculationData.base_salary }"
                        :disabled="loading"
                    />
                    <small class="p-error" v-if="submitted && !calculationData.base_salary">Salário base é obrigatório.</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="total_amount">Valor Total</label>
                    <InputNumber
                        id="total_amount"
                        v-model="calculationData.total_amount"
                        mode="currency"
                        currency="BRL"
                        locale="pt-BR"
                        :minFractionDigits="2"
                        :class="{ 'p-invalid': submitted && !calculationData.total_amount }"
                        :disabled="loading"
                    />
                    <small class="p-error" v-if="submitted && !calculationData.total_amount">Valor total é obrigatório.</small>
                </div>
            </div>

            <div class="col-12">
                <div class="field">
                    <label for="notes">Observações</label>
                    <Textarea
                        id="notes"
                        v-model="calculationData.notes"
                        rows="3"
                        :disabled="loading"
                    />
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" :disabled="loading" />
            <Button label="Salvar" icon="pi pi-check" class="p-button-text" @click="saveCalculation" :loading="loading" />
        </template>
    </Dialog>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useServiceStore } from '@/stores/service';

const serviceStore = useServiceStore();

const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    calculation: {
        type: Object,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:visible', 'save']);

const submitted = ref(false);
const services = computed(() => {
    return serviceStore.getServices || [];
});
const servicesLoading = computed(() => serviceStore.isLoading);
const calculationData = ref({ ...props.calculation });

const calculationTypes = ref([
    { label: 'Trabalhista', value: 'labor' },
    { label: 'Previdenciário', value: 'social_security' },
    { label: 'FGTS', value: 'fgts' }
]);

const statusOptions = ref([
    { label: 'Rascunho', value: 'draft' },
    { label: 'Em Andamento', value: 'in_progress' },
    { label: 'Em Revisão', value: 'review' },
    { label: 'Concluído', value: 'completed' },
    { label: 'Cancelado', value: 'cancelled' }
]);

// Atualiza calculationData quando a prop calculation mudar
watch(() => props.calculation, (newCalculation) => {
    calculationData.value = { ...newCalculation };
    
    // Converter datas de string para objeto Date
    if (calculationData.value.start_date && typeof calculationData.value.start_date === 'string') {
        calculationData.value.start_date = new Date(calculationData.value.start_date);
    }
    
    if (calculationData.value.end_date && typeof calculationData.value.end_date === 'string') {
        calculationData.value.end_date = new Date(calculationData.value.end_date);
    }
}, { deep: true });

const hideDialog = () => {
    emit('update:visible', false);
    submitted.value = false;
};

const saveCalculation = () => {
    submitted.value = true;

    if (calculationData.value.service && 
        calculationData.value.calculation_type && 
        calculationData.value.status && 
        calculationData.value.start_date && 
        calculationData.value.end_date && 
        calculationData.value.base_salary && 
        calculationData.value.total_amount) {
        
        // Preparar dados para envio
        const dataToSave = { ...calculationData.value };
        
        // Se service for um objeto, extrair apenas o ID
        if (dataToSave.service && typeof dataToSave.service === 'object') {
            dataToSave.service = dataToSave.service.id;
        }
        
        emit('save', dataToSave);
    }
};

// Carregar lista de serviços quando o componente for montado
onMounted(async () => {
    try {
        if (!services.value.length) {
            await serviceStore.fetchServices();
        }
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
});
</script>

<style scoped>
.field {
    margin-bottom: 1.5rem;
}
</style> 