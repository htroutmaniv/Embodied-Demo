from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

class UserAPITests(APITestCase):   

    def test_random_users_view(self):
        url = reverse('random-users')
        response = self.client.get(url)
        print("Response from /api/random-users/:", response.data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)
        
        for user in response.data:
            self.assertIn('name', user)
            self.assertIn('email', user)
            self.assertIn('age', user)


    def test_single_user_view(self):
        url = reverse('single-user')
        response = self.client.get(url)
        print("Response from /api/single-user/:", response.data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('name', response.data)
        self.assertIn('email', response.data)
        self.assertIn('age', response.data)
