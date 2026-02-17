// Regular Expressions
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\d{10}$/; 
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

// ===== REGISTRATION VALIDATION =====
export const validateRegistration = (formData) => {
  const errors = {};

  // 1. Name Check
  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters long.";
  }

  // 2. Email Check
  if (!EMAIL_REGEX.test(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }

  // 3. Phone Check (10 Digits)
  if (!PHONE_REGEX.test(formData.phone)) {
    errors.phone = "Phone number must be exactly 10 digits.";
  }

  // 4. Password Check (Strong)
  if (!PASSWORD_REGEX.test(formData.password)) {
    errors.password = "Password must be 8+ chars, include a number and a symbol (@$!%*#?&).";
  }

  // 5. Confirm Password
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
};

// ===== LOGIN VALIDATION =====
export const validateLogin = (formData) => {
  const errors = {};

  // 1. Email Check
  if (!formData.email || formData.email.trim().length === 0) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }

  // 2. Password Check
  if (!formData.password || formData.password.length === 0) {
    errors.password = "Password is required.";
  } else if (formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
};

// ===== ADD DENTIST VALIDATION =====
export const validateAddDentist = (formData) => {
  const errors = {};

  // 1. Name Check
  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters long.";
  }

  // 2. Email Check
  if (!EMAIL_REGEX.test(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }

  // 3. Phone Check (10 Digits)
  if (!PHONE_REGEX.test(formData.phone)) {
    errors.phone = "Phone number must be exactly 10 digits.";
  }

  // 4. Specialization Check
  if (!formData.specialization || formData.specialization.trim().length === 0) {
    errors.specialization = "Please select a specialization.";
  }

  return errors;
};

// ===== FORGOT PASSWORD EMAIL VALIDATION =====
export const validateForgotPasswordEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return "Email address is required.";
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address.";
  }
  return "";
};

// ===== PASSWORD UPDATE VALIDATION =====
export const validatePasswordUpdate = (newPassword, confirmPassword) => {
  const errors = {};

  // 1. Check if passwords are filled
  if (!newPassword || newPassword.length === 0) {
    errors.new = "New password is required.";
  } else if (!PASSWORD_REGEX.test(newPassword)) {
    errors.new = "Password must be 8+ chars, include a number & symbol.";
  }

  // 2. Check confirm password
  if (!confirmPassword || confirmPassword.length === 0) {
    errors.confirm = "Please confirm your password.";
  } else if (newPassword !== confirmPassword) {
    errors.confirm = "Passwords do not match.";
  }

  return errors;
};