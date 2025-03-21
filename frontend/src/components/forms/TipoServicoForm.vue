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
        client: null,
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
            
            // Garantir que client seja um número
            if (tipoServicoData.value.client && typeof tipoServicoData.value.client === 'object') {
                tipoServicoData.value.client = tipoServicoData.value.client.id;
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
            client: null,
            price: 0,
            status: true
        };
    };

    const hideDialog = () => {
        emit('hide');
    };

    const saveTipoServico = () => {
        if (!tipoServicoData.value.name || !tipoServicoData.value.client || !tipoServicoData.value.price) {
            return;
        }
        emit('save', tipoServicoData.value);
    };
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
    <Dialog 
        v-model:visible="dialogVisible" 
        :style="{ width: '450px' }" 
        :header="tipoServicoData.id ? 'Editar Tipo de Serviço' : 'Novo Tipo de Serviço'" 
        :modal="true" 
        class="p-fluid"
    >
        <div class="form-container">
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
                    v-model="tipoServicoData.client" 
                    :options="clients" 
                    optionLabel="name" 
                    optionValue="id" 
                    placeholder="Selecione um Cliente" 
                    :class="{ 'p-invalid': submitted && !tipoServicoData.client }" 
                    :loading="clientsLoading"
                />
                <small class="p-error" v-if="submitted && !tipoServicoData.client">Cliente é obrigatório.</small>
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
                <div class="flex flex-wrap gap-4">
                    <div class="flex gap-2">
                        <RadioButton 
                            id="status_active" 
                            name="status" 
                            :value="true" 
                            v-model="tipoServicoData.status" 
                        />
                        <label for="status_active">Ativo</label>
                    </div>
                    <div class="flex gap-2">
                        <RadioButton 
                            id="status_inactive" 
                            name="status" 
                            :value="false" 
                            v-model="tipoServicoData.status" 
                        />
                        <label for="status_inactive">Inativo</label>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="actions">
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
                    class="p-button-primary" 
                    @click="saveTipoServico" 
                    :loading="loading"
                />
            </div>
        </template>
    </Dialog>
</template> 