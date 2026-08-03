from rest_framework.test import APITestCase


class AuthFlowTests(APITestCase):
    def test_register_login_and_access_protected_endpoint(self):
        res = self.client.post('/api/users/register/', {
            'username': 'newuser', 'email': 'new@example.com',
            'password': 'testpass123', 'user_type': 'customer',
        })
        self.assertEqual(res.status_code, 201)

        res = self.client.post('/api/users/login/', {
            'username': 'newuser', 'password': 'testpass123',
        })
        access = res.data['access']

        res = self.client.get('/api/users/me/', HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['username'], 'newuser')

    def test_me_requires_authentication(self):
        res = self.client.get('/api/users/me/')
        self.assertEqual(res.status_code, 401)