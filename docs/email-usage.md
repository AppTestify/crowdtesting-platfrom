# Email Usage Documentation

This document outlines the usage of emails in the application for various functionalities.

## 1. Forgot Password
**Purpose**: To allow users to reset their password.

- **Trigger**: When a user requests to reset their password.
- **Content**:
  - **Subject**: `Reset Your Password`
  - **Body**:
    - A link to reset the password.
    - Information about the link expiry (e.g., valid for 24 hours).
  - **Actions**:
    - Clicking the link navigates the user to the change password page.

---

## 2. Email Verification
**Purpose**: To verify a user's email address.

- **Trigger**:
  - When a new user account is created.
  - When the user requests to resend the verification email from the dashboard.
- **Content**:
  - **Subject**: `Verify Your Email Address`
  - **Body**:
    - A link to verify the email.
    - Confirmation message after successful verification.
  - **Actions**:
    - Clicking the link marks the email as verified.

---

## 3. Document Verification (For Testers)
**Purpose**: Notify testers about the submission status of their documents.

- **Trigger**: When a tester submits their documents for verification.
- **Content**:
  - **Subject**: `Document Submission Confirmation`
  - **Body**:
    - Acknowledgment of document submission.
    - Information on the next steps (e.g., document review timeline).
    - Contact details for support if needed.

---

## 4. New User Added (For Admin)
**Purpose**: Notify system administrators when a new user is added.

- **Trigger**: When a new user is added to the system.
- **Content**:
  - **Subject**: `New User Added to the System`
  - **Body**:
    - Details of the new user (e.g., name, role, email).
    - Information on the user's access level.
    - Reminder to review and approve (if necessary).

---

## 5. Send Credentials
**Purpose**: Send login credentials to newly created users or resend credentials.

- **Trigger**:
  - When an admin creates a new user.
  - When credentials need to be resent.
- **Content**:
  - **Subject**: `Your Account Credentials`
  - **Body**:
    - Username and temporary password.
    - A link to the login page.
    - Instructions to change the password upon first login.
    - Support contact details in case of issues.
