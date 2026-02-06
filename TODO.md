# TODO - Cancelled Button & Mobile Number Validation

## Completed Tasks:
- [x] Add Cancel button to login popup (HomePages.js)
- [x] Add mobile number field to signup form with validation (Signup.js)

## Details:
### 1. HomePages.js Changes:
- ✅ Added Cancel button to login popup's .popup-actions section
- ✅ Cancel button calls closePopup() function to close the popup

### 2. Signup.js Changes:
- ✅ Added mobile number input field with placeholder "Mobile Number (starts with 789)"
- ✅ Only numeric input allowed (characters are filtered out via regex)
- ✅ Validation: mobile number must be 10 digits
- ✅ Validation: mobile number must start with "789"
- ✅ Real-time error feedback during typing
- ✅ Form validation on submit
- ✅ Added Cancel button to navigate back to home

