from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User, Group, Permission


class PermissionSerializer(serializers.ModelSerializer):
    content_type_name = serializers.SerializerMethodField()
    app_label = serializers.CharField(source='content_type.app_label', read_only=True)
    model = serializers.CharField(source='content_type.model', read_only=True)
    
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type', 'content_type_name', 'app_label', 'model']
    
    def get_content_type_name(self, obj):
        return f"{obj.content_type.app_label}.{obj.content_type.model}"


class GroupSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permission_ids']
    
    def create(self, validated_data):
        permission_ids = validated_data.pop('permission_ids', [])
        group = Group.objects.create(**validated_data)
        
        if permission_ids:
            group.permissions.set(permission_ids)
        
        return group
    
    def update(self, instance, validated_data):
        permission_ids = validated_data.pop('permission_ids', None)
        
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        
        if permission_ids is not None:
            instance.permissions.set(permission_ids)
        
        return instance
        
        
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=False)
    groups = GroupSerializer(many=True, read_only=True)
    group_ids = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='groups'
    )

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'password2', 'email', 'first_name', 'last_name', 
                 'is_active', 'groups', 'group_ids', 'date_joined', 'last_login')
        read_only_fields = ('date_joined', 'last_login')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
            'username': {'required': False},
            'is_active': {'required': False}
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
            is_active=validated_data.get('is_active', True)
        )
        
        user.set_password(validated_data['password'])
        
        # Adicionar grupos se fornecidos
        if 'groups' in validated_data:
            user.groups.set(validated_data['groups'])
        
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Atualizar campos normais
        for attr, value in validated_data.items():
            if attr != 'groups':  # Tratamos groups separadamente
                setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        # Atualizar grupos se fornecidos
        if 'groups' in validated_data:
            instance.groups.set(validated_data['groups'])
        
        instance.save()
        return instance

class UserListSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'groups', 'is_active', 'date_joined', 'last_login')
        read_only_fields = ('date_joined', 'last_login')