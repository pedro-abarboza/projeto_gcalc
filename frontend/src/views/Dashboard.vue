<script setup>
import { ref } from 'vue';
import BestSellingWidget from '@/components/dashboard/BestSellingWidget.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import RecentSalesWidget from '@/components/dashboard/RecentSalesWidget.vue';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import PermissionCheck from '@/components/permissions/PermissionCheck.vue';
// Imports dos componentes PrimeVue
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const stats = ref([
    {
        title: 'Serviços em Andamento',
        value: '15',
        icon: 'pi pi-spin pi-cog',
        color: 'bg-blue-100 text-blue-600',
        permission: 'ver_servicos'
    },
    {
        title: 'Serviços Concluídos',
        value: '85',
        icon: 'pi pi-check-circle',
        color: 'bg-green-100 text-green-600',
        permission: 'ver_servicos'
    },
    {
        title: 'Clientes Ativos',
        value: '24',
        icon: 'pi pi-users',
        color: 'bg-purple-100 text-purple-600',
        permission: 'ver_clientes'
    },
    {
        title: 'Faturamento Mensal',
        value: 'R$ 45.000',
        icon: 'pi pi-dollar',
        color: 'bg-yellow-100 text-yellow-600',
        permission: 'ver_financeiro'
    }
]);

const recentServices = ref([
    { id: 1, client: 'Empresa A', type: 'Cálculo Rescisório', status: 'Em Andamento', date: '2024-03-11' },
    { id: 2, client: 'Empresa B', type: 'Horas Extras', status: 'Concluído', date: '2024-03-10' },
    { id: 3, client: 'Empresa C', type: 'Férias', status: 'Em Revisão', date: '2024-03-09' },
    { id: 4, client: 'Empresa D', type: 'Verbas Rescisórias', status: 'Aguardando', date: '2024-03-08' }
]);

const statusSeverity = {
    'Em Andamento': 'info',
    'Concluído': 'success',
    'Em Revisão': 'warning',
    'Aguardando': 'danger'
};
</script>

<template>
    <div class="grid grid-cols-12 gap-8">
        <!-- Usando o componente PermissionCheck para o widget de estatísticas -->
        <PermissionCheck :permission="['ver_dashboard', 'admin']" :type="'any'">
            <StatsWidget />
        </PermissionCheck>

        <!-- Cards que só aparecem para usuários com permissões específicas -->
        <div v-permission:any="['ver_servicos', 'admin']" class="col-span-12 p-4 card">
            <h2 class="text-xl font-bold mb-4">Serviços Recentes</h2>
            <DataTable :value="recentServices" responsiveLayout="scroll" class="p-datatable-sm">
                <Column field="id" header="ID"></Column>
                <Column field="client" header="Cliente"></Column>
                <Column field="type" header="Tipo"></Column>
                <Column field="status" header="Status">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.status" :severity="statusSeverity[slotProps.data.status]" />
                    </template>
                </Column>
                <Column field="date" header="Data"></Column>
                <Column header="Ações">
                    <template #body>
                        <Button v-permission:any="['editar_servicos']" icon="pi pi-pencil" class="p-button-text p-button-sm" />
                        <Button v-permission:any="['excluir_servicos']" icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" />
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Conteúdo Financeiro - Disponível apenas para usuários com permissões financeiras -->
        <PermissionCheck permission="ver_financeiro" class="col-span-12 xl:col-span-6">
            <div class="card p-4">
                <h2 class="text-xl font-bold mb-4">Resumo Financeiro</h2>
                <RevenueStreamWidget />
                <!-- Ações que requerem permissões específicas -->
                <div class="mt-4 flex justify-end">
                    <Button v-permission:any="['gerar_relatorio']" label="Gerar Relatório" icon="pi pi-file-pdf" class="p-button-sm mr-2" />
                    <Button v-permission:all="['exportar_dados', 'admin']" label="Exportar Dados" icon="pi pi-download" class="p-button-sm" />
                </div>
            </div>
        </PermissionCheck>

        <!-- Cards originais com verificação de permissão -->
        <div class="col-span-12 xl:col-span-6">
            <PermissionCheck permission="ver_vendas">
                <RecentSalesWidget />
            </PermissionCheck>
            
            <PermissionCheck permission="ver_produtos">
                <BestSellingWidget />
            </PermissionCheck>
        </div>
        
        <div class="col-span-12 xl:col-span-6">
            <PermissionCheck permission="ver_financeiro">
                <RevenueStreamWidget />
            </PermissionCheck>
            
            <PermissionCheck permission="ver_notificacoes">
                <NotificationsWidget />
            </PermissionCheck>
        </div>
    </div>
</template>
