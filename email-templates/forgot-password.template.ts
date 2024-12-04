export const FORGOT_PASSWORD_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            margin: 50px auto;
            max-width: 600px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        .reset-button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #4CAF50;
            color: white !important;  
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
            margin-top: 20px;
        }
         
        .reset-button:hover {
            background-color: #45a049;  
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
            color: #999;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Password Reset Request</h1>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <a href="{resetLink}" class="reset-button">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        
        <p class="footer">Best regards, <br> CrowdTesting</p>
    </div>
</body>
</html>
`;