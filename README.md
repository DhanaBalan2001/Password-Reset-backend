#PASSWORD RESET FLOW 

   1. Overview :
      
      - This implementation covers the password reset functionality by setting up API routes in a Node.js/Express server.
      
      - It integrates MongoDB for database storage and key libraries like bcrypt, crypto/uuid, and NodeMailer to handle token generation, password hashing, and email delivery.

   2. Password Reset Flow :

      - POST /api/auth/forgot-password:

      - The server receives the user's email.

      - A check is performed to verify if the email exists in the database (MongoDB).

      - If found, a secure random token is generated, along with an expiration time.

   3. Token Storage :

      - The generated token, along with its expiration, is stored in the database for later validation.

   4. Email with Reset Link :

      - An email is sent to the user with a reset link that includes the token in the URL.

      - The reset link contains /api/auth/reset-password/:token, which the user clicks to begin the reset process.

      - GET /api/auth/reset-password/:token:

      - When the user clicks the reset link, the server checks the token in the database.
  
      - It validates whether the token matches and has not expired.
 
      - If valid, the user is redirected to the password reset form.

   5. Password Update :

      - After the user submits the new password, it is securely hashed using bcrypt.

      - The password is updated in the database, and the reset token is cleared.

   6. Token Expiry Handling :

      - If the token is expired or invalid, the user is shown an error message.

      - The token has a predefined expiration time, preventing its use after this time period.

   7. Technologies and Libraries:

      - bcrypt: For secure password hashing before saving to the database.

      - crypto or uuid: For generating a secure random token.

      - NodeMailer: For sending the password reset email with the reset link to the user.
     
        
By following this approach, you ensure that the password reset flow is secure, with token-based validation, and provides a user-friendly experience for resetting passwords.
