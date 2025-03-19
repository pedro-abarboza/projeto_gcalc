from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'password2', 'email', 'first_name', 'last_name', 'role', 'status')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
            'username': {'required': False}
        }

    def validate(self, attrs):
        # Verificar se é uma atualização ou criação
        if self.instance is None:  # Criação
            # Verificar campos obrigatórios para criação
            required_fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2']
            for field in required_fields:
                if field not in attrs:
                    raise serializers.ValidationError({field: f"O campo {field} é obrigatório para criação."})
            
            # Verificar se as senhas conferem
            if attrs['password'] != attrs.pop('password2'):
                raise serializers.ValidationError({"password": "As senhas não conferem"})
        else:  # Atualização
            # Se password estiver presente, password2 também deve estar
            if 'password' in attrs and 'password2' not in attrs:
                raise serializers.ValidationError({"password2": "A confirmação de senha é obrigatória."})
            
            # Se ambos estiverem presentes, verificar se conferem
            if 'password' in attrs and 'password2' in attrs:
                if attrs['password'] != attrs.pop('password2'):
                    raise serializers.ValidationError({"password": "As senhas não conferem"})
            # Se apenas password2 estiver presente, remover
            elif 'password2' in attrs:
                attrs.pop('password2')
                
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data.get('role', 'analyst'),
            status=validated_data.get('status', True)
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'status', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at') 