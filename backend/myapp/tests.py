from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

class UserAPITests(APITestCase):
    def test_random_users_view(self):
        """
        Test the random users API endpoint for returning 5 users with required fields.
        """
        url = reverse('random-users')
        response = self.client.get(url)
        
        print("Response from /api/random-users/:", response.data)
        
        # Ensure the request was successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Ensure 5 users are returned
        self.assertEqual(len(response.data), 5)
        
        # Ensure each user has the required fields
        for user in response.data:
            self.assertIn('name', user)
            self.assertIn('email', user)
            self.assertIn('age', user)
            # Additional checks can be added here if needed (e.g., email format)

    def test_single_user_view(self):
        """
        Test the single user API endpoint for returning a user with required fields.
        """
        url = reverse('single-user')
        response = self.client.get(url)
        
        print("Response from /api/single-user/:", response.data)
        
        # Ensure the request was successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Ensure the user has the required fields
        self.assertIn('name', response.data)
        self.assertIn('email', response.data)
        self.assertIn('age', response.data)
        # Additional checks can be added here if needed (e.g., email format)
