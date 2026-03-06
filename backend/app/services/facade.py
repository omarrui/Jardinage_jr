"""
Facade layer for the Jardinage Jr backend.

The goal of this facade is simply to provide ONE entry point between
the API layer (routes) and the business logic layer (services).

It wraps the existing services so the architecture matches the
required layered structure without rewriting the whole project.
"""

from app.services import customer_service, appointment_service, admin_service


class AppFacade:
    """
    Central coordinator between routes and services.
    Routes call the facade instead of importing services directly.
    """

    # -------- Customer actions --------

    def signup_customer(self, data):
        return customer_service.signup_customer(data)

    def login_customer(self, email, password):
        return customer_service.login_customer(email, password)

    def send_reset_code(self, email):
        return customer_service.send_reset_code(email)

    def reset_password(self, email, code, new_password):
        return customer_service.reset_password(email, code, new_password)

    def change_password(self, customer_id, old_password, new_password):
        return customer_service.change_password(customer_id, old_password, new_password)

    def get_customer_by_email(self, email):
        return customer_service.get_customer_by_email(email)

    # -------- Appointment actions --------

    def create_service_request(self, data):
        return appointment_service.create_service_request(data)

    def get_customer_requests(self, customer_id):
        return appointment_service.get_customer_requests(customer_id)

    def cancel_service_request(self, request_id, customer_id):
        return appointment_service.cancel_service_request(request_id, customer_id)

    def get_all_requests(self):
        return appointment_service.get_all_requests()

    def get_pending_requests_count(self):
        return appointment_service.get_pending_requests_count()

    def get_all_requests_with_customers(self):
        return appointment_service.get_all_requests_with_customers()

    # -------- Admin actions --------

    def admin_login(self, email, password):
        return admin_service.admin_login(email, password)

    def get_all_customers(self):
        return admin_service.get_all_customers()

    def create_customer_by_admin(self, data):
        return admin_service.create_customer_by_admin(data)


# Singleton instance used across the app
facade = AppFacade()
