<script setup>
import { ref } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import UserForm from '@/components/forms/UserForm.vue';

const users = ref([
    { id: 1, name: 'João Silva', email: 'joao@exemplo.com', role: 'Administrador', status: 'Ativo' },
    { id: 2, name: 'Maria Santos', email: 'maria@exemplo.com', role: 'Analista', status: 'Ativo' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@exemplo.com', role: 'Analista', status: 'Inativo' }
]);

const roles = ref(['Administrador', 'Analista', 'Revisor']);
const statuses = ref(['Ativo', 'Inativo']);

const visible = ref(false);
const submitted = ref(false);
const userDialog = ref(false);
const deleteUserDialog = ref(false);
const user = ref({});
const selectedUsers = ref(null);
const dt = ref();

const exportCSV = () => {
    dt.value.exportCSV();
};

const openNew = () => {
    user.value = {
        name: '',
        email: '',
        role: 'Analista',
        status: 'Ativo'
    };
    submitted.value = false;
    userDialog.value = true;
};

const hideDialog = () => {
    userDialog.value = false;
    submitted.value = false;
};

const saveUser = () => {
    submitted.value = true;

    if (user.value.name?.trim()) {
        if (user.value.id) {
            users.value[findIndexById(user.value.id)] = user.value;
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Atualizado', life: 3000 });
        } else {
            user.value.id = createId();
            users.value.push(user.value);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Criado', life: 3000 });
        }

        userDialog.value = false;
        user.value = {};
    }
};

const editUser = (editUser) => {
    user.value = { ...editUser };
    userDialog.value = true;
};

const confirmDeleteUser = (editUser) => {
    user.value = editUser;
    deleteUserDialog.value = true;
};

const deleteUser = () => {
    users.value = users.value.filter((val) => val.id !== user.value.id);
    deleteUserDialog.value = false;
    user.value = {};
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Removido', life: 3000 });
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < users.value.length; i++) {
        if (users.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const createId = () => {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
});

</script>

<template>
    <div class="card">
        <Toast />
        <Toolbar class="mb-4">
            <template #start>
                <div class="my-2">
                    <Button label="Novo Usuário" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                    <Button label="Excluir" icon="pi pi-trash" class="p-button-danger" :disabled="!selectedUsers || !selectedUsers.length" />
                </div>
            </template>
            <template #end>
                <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV" />
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            :value="users"
            v-model:selection="selectedUsers"
            dataKey="id"
            :paginator="true"
            :rows="10"
            v-model:filters="filters"
            :exportFilename="'usuarios'"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuários"
            responsiveLayout="scroll"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-between md:align-items-center">
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <h4 class="m-0">Gestão de Usuários</h4>
                    </span>

                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                        </IconField>
                    </span>
                </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="name" header="Nome" :sortable="true" headerStyle="width: 30%"></Column>
            <Column field="email" header="E-mail" :sortable="true" headerStyle="width: 25%"></Column>
            <Column field="role" header="Função" :sortable="true" headerStyle="width: 20%"></Column>
            <Column field="status" header="Status" :sortable="true" headerStyle="width: 15%">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" :severity="slotProps.data.status === 'Ativo' ? 'success' : 'danger'" />
                </template>
            </Column>
            <Column headerStyle="min-width:10rem;">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editUser(slotProps.data)" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDeleteUser(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Detalhes do Usuário" :modal="true" class="p-fluid">
            <UserForm 
                v-model:user="user"
                :submitted="submitted"
                @save="saveUser"
                @cancel="hideDialog"
            />
        </Dialog>

        <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="user">Tem certeza que deseja excluir <b>{{ user.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteUserDialog = false" />
                <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteUser" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.card {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 1rem;
}

.field {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.p-button {
    margin-right: 0.5rem;
}

.p-dialog .p-dialog-content {
    padding: 2rem;
}

.p-dialog .p-dialog-footer {
    padding: 1.5rem;
}
</style> 