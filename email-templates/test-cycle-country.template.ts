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
    <div>
        <p>Dear {fullName},</p>

        <p>We're excited to announce that a new testing cycle for <strong>{name}</strong> is now live, and we'd love for you to participate!</p>

        <div class="details">
            <p><strong>Test Start Date:</strong> {startDate}</p>
            <p><strong>Test End Date:</strong> {endDate}</p>
            <p><strong>Scope:</strong> {description}</p>
            <p><strong>Key Areas of Focus:</strong> {country}</p>
        </div>

        <p>To confirm your participation, please click the link below to join this test cycle:</p>
        <a href="{applyLink}" class="button">Confirm Participation</a>

        <p>Once you confirm, you can access the full test details and start testing.</p>
        
        <p><strong>Important:</strong> If you encounter any issues or have questions during the test, feel free to reach out to us at <a href="mailto:contact@apptestify.com">contact@apptestify.com</a>.</p>
        
        <p>Thank you for your continued support and participation. Your feedback is crucial to the success of this project.</p>
        
        <p>We look forward to having you on board!</p>

        <p>Best regards,<br>AppTestify Platform</p>
    </div>
</body>
</html>
`;
