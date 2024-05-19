import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer

class RandomUserView(APIView):
    """
    API view to fetch multiple random users.
    """
    def get(self, request):
        try:
            # Fetch 5 random users from the API
            response = requests.get('https://randomuser.me/api/?results=5&inc=name,email,dob&nat=us')
            response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        except requests.RequestException as e:
            # Return error response if API request fails
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Parse the API response JSON
            data = response.json().get('results', [])
            if not data:
                return Response({'error': 'No user data found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Process and structure user data
            users = [
                {
                    'name': f"{user['name']['first']} {user['name']['last']}",
                    'email': user['email'],
                    'age': user['dob']['age']
                } 
                for user in data
            ]
        except (ValueError, KeyError) as e:
            # Return error response if data processing fails
            return Response({'error': 'Error processing user data', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize the user data
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class RandomSingleUserView(APIView):
    """
    API view to fetch a single random user.
    """
    def get(self, request):
        try:
            # Fetch 1 random user from the API
            response = requests.get('https://randomuser.me/api/?results=1&inc=name,email,dob&nat=us')
            response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        except requests.RequestException as e:
            # Return error response if API request fails
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Parse the API response JSON
            data = response.json().get('results', [])
            if not data:
                return Response({'error': 'No user data found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Process and structure single user data
            user = data[0]
            user_data = {
                'name': f"{user['name']['first']} {user['name']['last']}",
                'email': user['email'],
                'age': user['dob']['age']
            }
        except (ValueError, KeyError, IndexError) as e:
            # Return error response if data processing fails
            return Response({'error': 'Error processing user data', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize the user data
        serializer = UserSerializer(user_data)
        return Response(serializer.data)
