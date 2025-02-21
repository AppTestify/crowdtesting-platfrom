export const TEST_CYCLE_COUNTRY_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Test Cycle Available</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        h1 {
            font-size: 22px;
            color: #2c3e50;
        }
        p {
            font-size: 16px;
            line-height: 1.5;
            color: #555;
        }
        .details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .details p {
            margin: 5px 0;
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
            margin-bottom: 10px;
        } 
        .button:hover { 
            background-color: #45a049; 
            cursor: pointer;
        } 
    </style>
</head>
<body>
{emailFormat}
</body>
</html>
`;
