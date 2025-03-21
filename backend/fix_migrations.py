"""
Script para corrigir inconsistências nas migrações.
"""
import os
import django
import sys

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Importar após a configuração do Django
from django.db import connection

def main():
    print("Verificando migrações aplicadas...")
    
    with connection.cursor() as cursor:
        # Obter todas as migrações
        cursor.execute("SELECT * FROM django_migrations WHERE app = 'services' AND name = '0007_alter_service_client_alter_servicetypeclient_client_and_more'")
        services_migrations = cursor.fetchall()
        
        # Verificar se a migração services.0007 existe
        if services_migrations:
            print(f"Migração services.0007 encontrada: {services_migrations}")
            
            # Remover a migração services.0007
            cursor.execute("DELETE FROM django_migrations WHERE app = 'services' AND name = '0007_alter_service_client_alter_servicetypeclient_client_and_more'")
            print("Migração services.0007 removida.")
            
            # Aplicar a migração clients.0001_initial (fake)
            cursor.execute("INSERT INTO django_migrations (app, name, applied) VALUES ('clients', '0001_initial', NOW())")
            print("Migração clients.0001_initial marcada como aplicada.")
            
            # Aplicar a migração clients.0002_copy_data (fake)
            cursor.execute("INSERT INTO django_migrations (app, name, applied) VALUES ('clients', '0002_copy_data', NOW())")
            print("Migração clients.0002_copy_data marcada como aplicada.")
            
            print("Migrações corrigidas com sucesso!")
        else:
            print("Migração services.0007 não encontrada. Não há necessidade de correção.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 