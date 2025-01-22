export const MAIL_TEMPLATE = ` 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AppTestify</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
        }
        .container {
            padding: 2px;
            margin: 50px auto;
            max-width: 600px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 10px;
        }
        p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        ul {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
            padding-left: 20px;
        }
        .highlight {
            color: #4CAF50;
            font-weight: bold;
        }
        .button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
            margin-top: 20px;
        }
        .button:hover {
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
        a {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div>
     {body} 
    </div>
</body>
</html>
`;
