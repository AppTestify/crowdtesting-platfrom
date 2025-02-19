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
            cusror: pointer;
        } 
    </style>
</head>
<body>
    <div >
        <h1>New Test Cycle Available</h1>
        <p>Dear {fullName},</p>
        <p>A new test cycle has been added to your country-based project. Below are the details:</p>
        
        <div class="details">
            <p><strong>Test Cycle:</strong> {name}</p>
            <p><strong>Description:</strong> {description}</p>
        </div>

        <p>If you're interested, click the button below to apply now:</p>

        <a href="{applyLink}" class="button">Apply Now</a>

        <p>If you have any questions, feel free to reach out.</p>
        <p>Best regards, <br> AppTestify Platform</p>

      
    </div>
</body>
</html>
`;
