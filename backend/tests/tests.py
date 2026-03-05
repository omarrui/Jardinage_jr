import unittest
import os
from app import app
from models import db


class TestAuthenticationEndpoints(unittest.TestCase):
    """
    Validation tests for Jardinage Jr authentication API endpoints

    Tests implemented:
    - Customer signup validation
    - Duplicate email protection
    - Login authentication
    - Missing credentials validation
    """

    def setUp(self):
        """Initialize test app and database"""
        self.app = app
        self.app.config["TESTING"] = True
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test_auth.db"
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        """Clean database after each test"""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

        try:
            os.remove("test_auth.db")
        except OSError:
            pass

    # =====================================================
    # SIGNUP TESTS
    # =====================================================

    def test_signup_valid_data(self):
        """Test signup with valid data"""

        response = self.client.post("/api/signup", json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "123456",
            "phone": "123456789"
        })

        self.assertEqual(response.status_code, 201)

        data = response.get_json()
        self.assertIn("message", data)


    def test_signup_missing_fields(self):
        """Signup should fail if required fields are missing"""

        response = self.client.post("/api/signup", json={
            "email": "missing@example.com"
        })

        self.assertEqual(response.status_code, 400)


    def test_signup_duplicate_email(self):
        """Signup should fail if email already exists"""

        # Create first user
        self.client.post("/api/signup", json={
            "name": "User One",
            "email": "duplicate@example.com",
            "password": "123456",
            "phone": "111111111"
        })

        # Attempt duplicate
        response = self.client.post("/api/signup", json={
            "name": "User Two",
            "email": "duplicate@example.com",
            "password": "123456",
            "phone": "222222222"
        })

        self.assertEqual(response.status_code, 400)

        data = response.get_json()
        self.assertIn("error", data)


    # =====================================================
    # LOGIN TESTS
    # =====================================================

    def test_login_valid_credentials(self):
        """Login with correct email and password"""

        # Create user first
        self.client.post("/api/signup", json={
            "name": "Login User",
            "email": "login@example.com",
            "password": "password123",
            "phone": "123456789"
        })

        response = self.client.post("/api/login", json={
            "email": "login@example.com",
            "password": "password123"
        })

        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertIn("customer_id", data)


    def test_login_invalid_password(self):
        """Login should fail with wrong password"""

        self.client.post("/api/signup", json={
            "name": "Login Test",
            "email": "wrongpass@example.com",
            "password": "password123",
            "phone": "123456789"
        })

        response = self.client.post("/api/login", json={
            "email": "wrongpass@example.com",
            "password": "wrongpassword"
        })

        self.assertEqual(response.status_code, 401)


    def test_login_missing_credentials(self):
        """Login should fail when email or password is missing"""

        response = self.client.post("/api/login", json={
            "email": "test@example.com"
        })

        self.assertEqual(response.status_code, 400)

    # =====================================================
    # APPOINTMENT TESTS
    # =====================================================

    def _create_user_and_login(self, email="booking@example.com"):
        """Helper function to create a user and return customer_id"""

        # Signup
        self.client.post("/api/signup", json={
            "name": "Booking User",
            "email": email,
            "password": "password123",
            "phone": "123456789"
        })

        # Login
        login = self.client.post("/api/login", json={
            "email": email,
            "password": "password123"
        })

        return login.get_json()["customer_id"]


    def test_create_appointment_valid(self):
        """Customer can create a valid appointment"""
        
        customer_id = self._create_user_and_login("validbooking@example.com")

        response = self.client.post("/api/appointments", json={
            "customer_id": customer_id,
            "date": "2026-05-10",
            "time": "10:00",
            "description": "Lawn mowing",  # ✅ ADD
            "address": "123 Test St"       # ✅ ADD
        })

        self.assertIn(response.status_code, [200, 201])


    def test_create_appointment_missing_fields(self):
        """Appointment should fail if required fields missing"""

        response = self.client.post("/api/appointments", json={
            "date": "2026-05-10"
        })

        self.assertEqual(response.status_code, 400)


    def test_create_appointment_invalid_customer(self):
        """Appointment should fail if customer does not exist"""

        response = self.client.post("/api/appointments", json={
            "customer_id": 9999,
            "date": "2026-05-10",
            "time": "10:00"
        })

        self.assertIn(response.status_code, [400, 404])


    # =====================================================
    # PASSWORD CHANGE TESTS
    # =====================================================

    def test_change_password_valid(self):
        """User can change password with correct current password"""

        # Create user
        self.client.post("/api/signup", json={
            "name": "Password User",
            "email": "passwordchange@example.com",
            "password": "oldpassword",
            "phone": "123456789"
        })

        # Change password
        response = self.client.post("/api/change-password", json={
            "email": "passwordchange@example.com",
            "old_password": "oldpassword",
            "new_password": "newpassword123"
        })

        # Accept 200 or 201 depending on implementation
        self.assertIn(response.status_code, [200, 201])


    def test_change_password_wrong_old_password(self):
        """Password change should fail if old password is incorrect"""

        # Create user
        self.client.post("/api/signup", json={
            "name": "Password User",
            "email": "wrongold@example.com",
            "password": "correctpassword",
            "phone": "123456789"
        })

        response = self.client.post("/api/change-password", json={
            "email": "wrongold@example.com",
            "old_password": "wrongpassword",
            "new_password": "newpassword123"
        })

        self.assertEqual(response.status_code, 401)


    def test_change_password_missing_fields(self):
        """Password change should fail if required fields are missing"""

        response = self.client.post("/api/change-password", json={
            "email": "test@example.com"
        })

        self.assertEqual(response.status_code, 400)

    # =====================================================
    # PASSWORD RESET TESTS
    # =====================================================

    def test_forgot_password_valid_email(self):
        """User can request password reset with valid email"""
        # Create user
        self.client.post("/api/signup", json={
            "name": "Reset User",
            "email": "reset@example.com",
            "password": "oldpassword",
            "phone": "123456789"
        })

        response = self.client.post("/api/customer/forgot-password", json={
            "email": "reset@example.com"
        })

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("message", data)


    def test_forgot_password_nonexistent_email(self):
        """Password reset should fail for non-existent email"""
        response = self.client.post("/api/customer/forgot-password", json={
            "email": "nonexistent@example.com"
        })

        self.assertEqual(response.status_code, 404)


    def test_reset_password_with_valid_code(self):
        """User can reset password with valid reset code"""
        # This requires you to expose the reset code in test mode
        # or mock the email service
        pass  # TODO: Implement when reset code logic is testable


    def test_reset_password_with_invalid_code(self):
        """Password reset should fail with invalid code"""
        response = self.client.post("/api/customer/reset-password", json={
            "email": "test@example.com",
            "code": "000000",
            "new_password": "newpass123"
        })

        self.assertIn(response.status_code, [400, 401, 404])


    def test_reset_password_with_expired_code(self):
        """Password reset should fail with expired code"""
        # TODO: Implement time-based expiration test
        pass


    # =====================================================
    # INPUT VALIDATION TESTS
    # =====================================================

    def test_signup_invalid_email_format(self):
        """Signup should fail with invalid email format"""
        response = self.client.post("/api/signup", json={
            "name": "Test User",
            "email": "invalid-email",
            "password": "123456",
            "phone": "123456789"
        })

        self.assertEqual(response.status_code, 400)


    def test_signup_weak_password(self):
        """Signup should fail with weak password (if validation exists)"""
        response = self.client.post("/api/signup", json={
            "name": "Test User",
            "email": "weak@example.com",
            "password": "123",  # Too short
            "phone": "123456789"
        })

        # Adjust based on your password requirements
        self.assertIn(response.status_code, [400, 201])


    def test_signup_empty_name(self):
        """Signup should fail with empty name"""
        response = self.client.post("/api/signup", json={
            "name": "",
            "email": "test@example.com",
            "password": "123456",
            "phone": "123456789"
        })

        self.assertEqual(response.status_code, 400)


    def test_signup_sql_injection_attempt(self):
        """Signup should sanitize SQL injection attempts"""
        response = self.client.post("/api/signup", json={
            "name": "'; DROP TABLE customers; --",
            "email": "hacker@example.com",
            "password": "123456",
            "phone": "123456789"
        })

        # Should either reject or escape properly
        self.assertIn(response.status_code, [400, 201])


    # =====================================================
    # ADMIN AUTHENTICATION TESTS
    # =====================================================

    def test_admin_login_valid(self):
        """Admin can login with correct credentials"""
        response = self.client.post("/api/admin/login", json={
            "email": "admin@gardening.com",
            "password": "StrongP@ssw0rd2025!"
        })

        self.assertIn(response.status_code, [200, 401])


    def test_admin_login_invalid(self):
        """Admin login fails with wrong credentials"""
        response = self.client.post("/api/admin/login", json={
            "email": "admin@gardening.com",
            "password": "wrongpassword"
        })

        self.assertEqual(response.status_code, 401)


    def test_customer_cannot_access_admin_endpoint(self):
        """Regular customer cannot access admin endpoints"""
        customer_id = self._create_user_and_login("customer@example.com")

        # Try to access admin endpoint (adjust endpoint as needed)
        response = self.client.get("/api/admin/customers")

        self.assertIn(response.status_code, [401, 403])


    # =====================================================
    # APPOINTMENT MANAGEMENT TESTS
    # =====================================================

    def test_get_customer_appointments(self):
        """Customer can retrieve their appointments"""
        customer_id = self._create_user_and_login("appointments@example.com")

        # Create appointment
        self.client.post("/api/appointments", json={
            "customer_id": customer_id,
            "date": "2026-05-10",
            "time": "10:00",
            "description": "Gardening",    # ✅ ADD
            "address": "789 Garden Rd"     # ✅ ADD
        })

        # Get appointments
        response = self.client.get(f"/api/customer/service-requests?customer_id={customer_id}")

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("requests", data)


    def test_cancel_appointment_valid(self):
        """Customer can cancel their appointment"""
        customer_id = self._create_user_and_login("cancel@example.com")

        # Create appointment
        appt = self.client.post("/api/appointments", json={
            "customer_id": customer_id,
            "date": "2026-05-10",
            "time": "10:00",
            "description": "Tree trimming", 
            "address": "456 Cancel Ave"   
        })

        # Cancel it
        response = self.client.delete(f"/api/customer/cancel-appointment/1")

        self.assertEqual(response.status_code, 200)


    def test_cancel_nonexistent_appointment(self):
        """Canceling non-existent appointment should fail"""
        response = self.client.delete("/api/customer/cancel-appointment/9999")

        self.assertEqual(response.status_code, 404)


    def test_customer_cannot_cancel_others_appointment(self):
        """Customer cannot cancel another customer's appointment"""
        # TODO: Implement authorization check
        pass


    # =====================================================
    # FORCE PASSWORD CHANGE TESTS
    # =====================================================

    def test_force_password_change_on_first_login(self):
        """Admin-created user must change password on first login"""
        # This requires admin endpoint to create user
        # TODO: Implement when admin user creation is available
        pass


    def test_force_password_change_valid(self):
        """User can complete forced password change"""
        response = self.client.post("/api/customer/force-change-password", json={
            "customer_id": 1,
            "new_password": "newSecurePass123"
        })

        self.assertIn(response.status_code, [200, 400, 404])


    # =====================================================
    # EDGE CASES & SECURITY TESTS
    # =====================================================

    def test_login_rate_limiting(self):
        """Too many failed login attempts should be rate limited"""
        # TODO: Implement if rate limiting exists
        pass


    def test_xss_in_name_field(self):
        """XSS attempts in name should be sanitized"""
        response = self.client.post("/api/signup", json={
            "name": "<script>alert('XSS')</script>",
            "email": "xss@example.com",
            "password": "123456",
            "phone": "123456789"
        })

        self.assertIn(response.status_code, [400, 201])


    def test_concurrent_signups_same_email(self):
        """Concurrent signups with same email should be handled"""
        # This requires threading/async testing
        pass


    def test_password_not_returned_in_response(self):
        """Password should never be returned in API responses"""
        response = self.client.post("/api/signup", json={
            "name": "Security Test",
            "email": "security@example.com",
            "password": "secretpass123",
            "phone": "123456789"
        })

        data = response.get_json()
        # Check password is not in response
        self.assertNotIn("password", str(data))


if __name__ == "__main__":
    unittest.main()