export const TESTER_INFORMATION_TEMPLATE = ` 
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
    <h1>{greeting} <span class="highlight">{name}</span>,</h1>
    <p>Thank you for registering on AppTestify, the premier crowd-testing platform! We're excited to have you onboard as a tester. To get started and begin participating in testing projects, we kindly ask you to complete your profile.</p>

    <p>Please follow the steps below to complete your registration:</p>
    <ul>
        <li>
            <strong>Complete Your Profile:</strong> 
            <span style="margin-right: 8px;">📋</span>
            Log in to your AppTestify account and update your personal details, such as your name, location, and contact information.
        </li>
        <li>
            <strong>Add Your Skills & Expertise:</strong> 
            <span style="margin-right: 8px;">💻</span>
            Specify the testing skills, tools, and technologies you are proficient in. This will help us match you with the most relevant projects.
        </li>
        <li>
            <strong>Upload Your Certifications:</strong> 
            <span style="margin-right: 8px;">📜</span>
            If you have any testing-related certifications, please upload them to validate your expertise and enhance your profile.
        </li>
        <li>
            <strong>Submit Valid ID Proof:</strong> 
            <span style="margin-right: 8px;">🆔</span>
            For verification purposes, upload a valid government-issued ID (such as a passport, driver's license, or national ID card).
        </li>
        <li>
            <strong>Provide Payment Information:</strong> 
            <span style="margin-right: 8px;">💳</span>
            Add your PayPal ID or UPI ID to ensure you receive payments for the work you complete. This step is essential to ensure seamless payment processing.
        </li>
    </ul>

    <p><a href="{link}" class="button">Get Started Now</a></p>

    <p>Once your profile is complete, you'll be able to start receiving invitations to testing projects and earn money for your contributions!</p>

    <p>If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:contact@apptestify.com">contact@apptestify.com</a>.</p>

    <p>We're looking forward to seeing your valuable contributions in our testing community.</p>

    <p>Best regards,</p>
    <p class="highlight">The AppTestify Team</p>
</div>
</body>
</html>
`;
