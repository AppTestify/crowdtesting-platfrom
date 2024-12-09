export const NEW_USER_ADDED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New User Added</title>
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
        .user-details {
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
    </style>
</head>
<body>
    <div class="container">
        <h1>New User Added</h1>
        <p class="content">A new user has been added to the system. Below are the details of the new user:</p>

        <div class="user-details">
            <strong>Email:</strong> {email} <br>
            <strong>Role:</strong> {role} <br>
        </div>

        <p class="content">Please verify the user details and take necessary actions.</p>

    </div>
</body>
</html>
`;
