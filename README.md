# Django Backend with OAuth

## Overview
This is a backend application built using Django and OAuth2 for managing users, clients, and services. The project includes models for User, Client, ServiceType, and ServiceDistribution.

## Tech Stack
- Python
- Django
- OAuth2

## Environment
- Code-only development

## Project Structure
```
/home/project/manage.py
/home/project/backend
/home/project/backend/settings.py
/home/project/backend/urls.py
/home/project/backend/wsgi.py
/home/project/user_module
/home/project/user_module/models.py
/home/project/client_module
/home/project/client_module/models.py
/home/project/service_module
/home/project/service_module/models.py
/home/project/user_module/urls.py
/home/project/client_module/urls.py
/home/project/service_module/urls.py
/home/project/user_module/views.py
/home/project/client_module/views.py
/home/project/service_module/views.py
/home/project/home_module
/home/project/home_module/models.py
/home/project/home_module/serializers.py
/home/project/home_module/views.py
/home/project/home_module/urls.py
```

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Create a Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the Development Server**
   ```bash
   python manage.py runserver
   ```

6. **Access the Application**
   Open your browser and go to `http://127.0.0.1:8000/`.

## Contributing
Feel free to contribute by submitting pull requests or opening issues.

## License
This project is licensed under the MIT License.
```
