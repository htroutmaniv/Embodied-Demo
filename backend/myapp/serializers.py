from rest_framework import serializers

class UserSerializer(serializers.Serializer):
    """
    Serializer class for user data. Converts data between complex types 
    (like queryset and model instances) and native Python datatypes.
    """
    name = serializers.CharField(
        max_length=100,
        error_messages={
            'blank': 'Name cannot be blank.',
            'max_length': 'Name cannot exceed 100 characters.'
        }
    )
    email = serializers.EmailField(
        error_messages={
            'invalid': 'Enter a valid email address.',
            'blank': 'Email cannot be blank.'
        }
    )
    age = serializers.CharField(
        max_length=100,
        error_messages={
            'blank': 'Age cannot be blank.',
            'max_length': 'Age cannot exceed 100 characters.'
        }
    )
