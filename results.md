# Jardinage Jr – Backend API Testing Evidence

## Testing Framework
The backend API was tested using Python’s **unittest** framework executed through **pytest**.  
The tests simulate HTTP requests to the Flask API and verify response codes, validation rules, and authentication behavior.

## Command Used
```
pytest tests/tests.py
```

## Environment
- Operating System: macOS  
- Python Version: 3.13.5  
- Testing Framework: pytest 9.0.2  
- Database: SQLite (test database)

## Test Results Summary

- **Total Tests Executed:** 34  
- **Tests Passed:** 34  
- **Tests Failed:** 0  
- **Warnings:** 8  

All automated backend tests executed successfully.

## Test Coverage

### Authentication Tests
- Customer signup validation  
- Duplicate email protection  
- Login authentication  
- Missing credentials handling  

### Password Management Tests
- Password change with correct credentials  
- Password change validation for incorrect current password  
- Missing fields during password change  
- Password reset request via email  
- Password reset code validation  

### Appointment System Tests
- Create service request (appointment)  
- Appointment creation validation  
- Handling invalid customer IDs  
- Retrieve customer appointments  
- Cancel appointment requests  
- Prevent cancelling non-existent requests  

### Admin & Authorization Tests
- Admin login validation  
- Prevent customers from accessing admin endpoints  

### Security Tests
- SQL injection attempt detection  
- XSS input sanitization  
- Password exposure prevention in API responses  

## Important Security Verification

The tests confirmed that:

- Passwords are never returned in API responses.  
- Duplicate accounts cannot be created using the same email.  
- Unauthorized users cannot access protected endpoints.  
- Input validation protects against common injection attempts.

## Warnings Observed

Some warnings were produced during test execution due to SQLAlchemy API deprecations and datetime usage.

Examples:
- SQLAlchemy `Query.get()` method marked as legacy in version 2.0  
- `datetime.utcnow()` scheduled for removal in future Python versions  

These warnings do not affect the correctness of the application but should be updated in future revisions.

## Conclusion

All backend API endpoints behaved as expected under automated testing.  
The system correctly handled authentication, appointment management, and input validation scenarios.

The automated testing suite helps ensure reliability, security, and correctness of the Jardinage Jr backend services.
