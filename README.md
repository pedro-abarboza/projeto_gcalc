# Sistema de Gestão de Cálculos Trabalhistas (GCALC)

Sistema web para gestão de cálculos trabalhistas, com backend em Django REST Framework, frontend em Vue.js (PrimeVue + Tailwind CSS) e banco de dados PostgreSQL.

## Estrutura do Projeto

- **Backend**: API REST desenvolvida com Django REST Framework
- **Frontend**: Interface de usuário desenvolvida com Vue.js, PrimeVue e Tailwind CSS

## Módulos Principais

1. **Usuários**: Gestão de usuários e permissões
2. **Clientes**: Cadastro e gestão de clientes
3. **Serviços**: Gestão de serviços e cálculos trabalhistas
4. **Distribuição de Tarefas**: Sistema inteligente de alocação de cálculos
5. **Auditoria**: Revisão e validação de cálculos
6. **Envio de Cálculos**: Geração e envio de relatórios

## Requisitos

### Backend
- Python 3.8+
- Django 4.2+
- PostgreSQL 13+

### Frontend
- Node.js 16+
- Vue.js 3
- PrimeVue
- Tailwind CSS

## Instalação e Configuração

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Funcionalidades Principais

- CRUD completo para usuários, clientes e serviços
- Captura automática de e-mails para criação de serviços
- Distribuição inteligente de tarefas
- Sistema de auditoria e revisão
- Geração de relatórios em PDF
- Notificações e alertas automáticos
