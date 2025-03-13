<script setup>
import { ref } from 'vue';
import BestSellingWidget from '@/components/dashboard/BestSellingWidget.vue';
import NotificationsWidget from '@/components/dashboard/NotificationsWidget.vue';
import RecentSalesWidget from '@/components/dashboard/RecentSalesWidget.vue';
import RevenueStreamWidget from '@/components/dashboard/RevenueStreamWidget.vue';
import StatsWidget from '@/components/dashboard/StatsWidget.vue';

const stats = ref([
    {
        title: 'Serviços em Andamento',
        value: '15',
        icon: 'pi pi-spin pi-cog',
        color: 'bg-blue-100 text-blue-600'
    },
    {
        title: 'Serviços Concluídos',
        value: '85',
        icon: 'pi pi-check-circle',
        color: 'bg-green-100 text-green-600'
    },
    {
        title: 'Clientes Ativos',
        value: '24',
        icon: 'pi pi-users',
        color: 'bg-purple-100 text-purple-600'
    },
    {
        title: 'Faturamento Mensal',
        value: 'R$ 45.000',
        icon: 'pi pi-dollar',
        color: 'bg-yellow-100 text-yellow-600'
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
        <StatsWidget />

        <div class="col-span-12 xl:col-span-6">
            <RecentSalesWidget />
            <BestSellingWidget />
        </div>
        <div class="col-span-12 xl:col-span-6">
            <RevenueStreamWidget />
            <NotificationsWidget />
        </div>
    </div>
</template>
