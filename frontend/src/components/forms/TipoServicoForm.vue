<script setup>
    import { ref, watch, computed, onMounted } from 'vue';
    import { useClientStore } from '@/stores/client';
    import { useTipoServicoClienteStore } from '@/stores/tipoServicoCliente';

    // Props
    const props = defineProps({
        visible: {
            type: Boolean,
            required: true
        },
        tipoServico: {
            type: Object,
            required: true
        },
        submitted: {
            type: Boolean,
            required: true
        },
        loading: {
            type: Boolean,
            default: false
        }
    });

    // Emits
    const emit = defineEmits(['update:visible', 'save', 'hide']);

    // Stores
    const clientStore = useClientStore();
    const tipoServicoClienteStore = useTipoServicoClienteStore();

    // Estado
    const tipoServicoData = ref({
        id: null,
        name: '',
        description: '',
        client_id: null,
        price: 0,
        status: true
    });

    // Computed
    const clients = computed(() => clientStore.clients);
    const clientsLoading = computed(() => clientStore.isLoading);
    
    // Computed para controlar a visibilidade do diálogo
    const dialogVisible = computed({
        get: () => props.visible,
        set: (value) => emit('update:visible', value)
    });

    // Lifecycle hooks
    onMounted(async () => {
        await loadClients();
    });

    // Watchers
    watch(() => props.visible, (newValue) => {
        if (!newValue) {
            resetForm();
        }
    });

    watch(() => props.tipoServico, (newValue) => {
        if (newValue && Object.keys(newValue).length > 0) {
            tipoServicoData.value = { ...newValue };
            
            // Garantir que client_id seja um número
            if (tipoServicoData.value.client && typeof tipoServicoData.value.client === 'object') {
                tipoServicoData.value.client_id = tipoServicoData.value.client.id;
            }
            
            // Garantir que status seja um booleano
            if (typeof tipoServicoData.value.status === 'string') {
                tipoServicoData.value.status = tipoServicoData.value.status === 'true';
            }
        }
    }, { deep: true, immediate: true });

    // Métodos
    const loadClients = async () => {
        try {
            if (clients.value.length === 0) {
                await clientStore.fetchClients({ status: true });
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    };

    const resetForm = () => {
        tipoServicoData.value = {
            id: null,
            name: '',
            description: '',
            client_id: null,
            price: 0,
            status: true
        };
    };

    const hideDialog = () => {
        emit('hide');
    };

    const saveTipoServico = () => {
        if (!tipoServicoData.value.name || !tipoServicoData.value.client_id || !tipoServicoData.value.price) {
            return;
        }
        emit('save', tipoServicoData.value);
    };
</script>

<template>
    <Dialog 
        v-model:visible="dialogVisible" 
        :style="{ width: '450px' }" 
        :header="tipoServicoData.id ? 'Editar Tipo de Serviço' : 'Novo Tipo de Serviço'" 
        :modal="true" 
        class="p-fluid"
    >
        <div class="field">
            <label for="name">Nome *</label>
            <InputText 
                id="name" 
                v-model.trim="tipoServicoData.name" 
                required="true" 
                autofocus 
                :class="{ 'p-invalid': submitted && !tipoServicoData.name }" 
            />
            <small class="p-error" v-if="submitted && !tipoServicoData.name">Nome é obrigatório.</small>
        </div>
        <div class="field">
            <label for="client">Cliente *</label>
            <Dropdown 
                id="client" 
                v-model="tipoServicoData.client_id" 
                :options="clients" 
                optionLabel="name" 
                optionValue="id" 
                placeholder="Selecione um Cliente" 
                :class="{ 'p-invalid': submitted && !tipoServicoData.client_id }" 
                :loading="clientsLoading"
            />
            <small class="p-error" v-if="submitted && !tipoServicoData.client_id">Cliente é obrigatório.</small>
        </div>
        <div class="field">
            <label for="description">Descrição</label>
            <Textarea 
                id="description" 
                v-model="tipoServicoData.description" 
                rows="3" 
                cols="20" 
            />
        </div>
        <div class="field">
            <label for="price">Preço *</label>
            <InputNumber 
                id="price" 
                v-model="tipoServicoData.price" 
                mode="currency" 
                currency="BRL" 
                locale="pt-BR" 
                :minFractionDigits="2" 
                :class="{ 'p-invalid': submitted && !tipoServicoData.price }" 
            />
            <small class="p-error" v-if="submitted && !tipoServicoData.price">Preço é obrigatório.</small>
        </div>
        <div class="field">
            <label for="status">Status</label>
            <div class="formgrid grid">
                <div class="field-radiobutton col-6">
                    <RadioButton 
                        id="status1" 
                        name="status" 
                        :value="true" 
                        v-model="tipoServicoData.status" 
                    />
                    <label for="status1">Ativo</label>
                </div>
                <div class="field-radiobutton col-6">
                    <RadioButton 
                        id="status2" 
                        name="status" 
                        :value="false" 
                        v-model="tipoServicoData.status" 
                    />
                    <label for="status2">Inativo</label>
                </div>
            </div>
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
                @click="saveTipoServico" 
                :loading="loading"
            />
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1.5rem;
}
</style> 