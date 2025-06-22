export const REQUIREMENT_ASSIGN_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Requirement Assignment</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
        .details {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
        }
        .details p {
            margin: 8px 0;
        }
        .details strong {
            color: #333;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            text-align: center;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
        .highlight {
            background-color: #e8f5e8;
            padding: 2px 6px;
            border-radius: 4px;
            color: #2e7d32;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <p>Dear {fullName},</p>
        <p>I hope you're doing well.</p>
        <p>A new requirement has been assigned to you in the <span class="highlight">{projectName}</span> project. Please review the details below:</p>
        
        <div class="details">
            <p><strong>Requirement:</strong> {title}</p>
            <p><strong>Description:</strong> {description}</p>
            <p><strong>Assigned By:</strong> {assignedBy}</p>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Project:</strong> {projectName}</p>
            <p><strong>Start Date:</strong> {startDate}</p>
            <p><strong>End Date:</strong> {endDate}</p>
        </div>
        
        <p>Please login to your dashboard to view the complete requirement details and start working on it. If you have any questions or need clarification, don't hesitate to reach out to the project team.</p>
        
        <p>We appreciate your attention to this requirement and look forward to your contributions.</p>
        
        <p>Best regards,<br>AppTestify Platform Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from AppTestify Platform. Please do not reply to this email.</p>
        <p>If you need assistance, please contact our <a href="mailto:support@apptestify.com">support team</a>.</p>
    </div>
</body>
</html>
`; 