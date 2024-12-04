export const SEND_CREDENTIALS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Credentials for Your Account</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content {
            font-size: 16px;
            color: #333333;
            margin-bottom: 20px;
        }
        .credentials {
            background-color: #f8f8f8;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
            font-family: monospace, Courier, "Courier New", sans-serif;
            border: 1px solid #ddd;
        }
        .footer {
            font-size: 14px;
            color: #888888;
            text-align: center;
            margin-top: 20px;
        }
        .button {
            background-color: #4CAF50;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Account Credentials</h1>
        <p class="content">Dear {role},</p>
        <p class="content">Below are your account credentials:</p>

        <div class="credentials">
            <strong>Email:</strong> {email} <br>
            <strong>Password:</strong> {password} <br>
        </div>

        <p class="content">Please keep your credentials safe and secure. If you have any questions or need further assistance, feel free to reach out to our support team.</p>

        <p class="footer">Best regards, <br> CrowdTesting</p>
    </div>
</body>
</html>
`;
