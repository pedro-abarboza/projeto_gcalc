import { createApp } from 'vue';

// PrimeVue e serviços
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import StyleClass from 'primevue/styleclass';

// Temas e estilos
import Aura from '@primeuix/themes/aura';

// Componentes
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import SelectButton from 'primevue/selectbutton';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import Tag from 'primevue/tag';
import InputNumber from 'primevue/inputnumber';
import RadioButton from 'primevue/radiobutton';
import Textarea from 'primevue/textarea';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Menu from 'primevue/menu';
import Chart from 'primevue/chart';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';



export function registerPrimeVue(app) {
    // Registra serviços
    app.use(PrimeVue, {
        ripple: true,
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: '.app-dark'
            }
        }
    });
    app.use(ConfirmationService);
    app.use(ToastService);

    // Registra diretivas
    app.directive('styleclass', StyleClass);

    // Registra componentes
    app.component('Button', Button);
    app.component('InputText', InputText);
    app.component('Password', Password);
    app.component('Checkbox', Checkbox);
    app.component('SelectButton', SelectButton);
    app.component('DataTable', DataTable);
    app.component('Column', Column);
    app.component('Dialog', Dialog);
    app.component('Toast', Toast);
    app.component('Toolbar', Toolbar);
    app.component('Tag', Tag);
    app.component('InputNumber', InputNumber);
    app.component('RadioButton', RadioButton);
    app.component('Textarea', Textarea);
    app.component('IconField', IconField);
    app.component('InputIcon', InputIcon);
    app.component('Menu', Menu);
    app.component('Chart', Chart);
    app.component('Dropdown', Dropdown);
    app.component('Calendar', Calendar);
    return app;
} 