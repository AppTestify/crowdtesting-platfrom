export const TASK_ASSIGN_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Task Assignment</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
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
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .details p {
            margin: 5px 0;
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
        <p>Dear {fullName},</p>
        <p>I hope you're doing well.</p>
        <p>I wanted to inform you that a new task has been assigned to you. Below are the details:</p>
        <div class="details">
            <p><strong>Task:</strong> {name}</p>
            <p><strong>Description:</strong> {description}</p>
            <p><strong>Assigned By:</strong> {assignedBy}</p>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Priority:</strong> {priority}</p>
        </div>
        <p>Please review the task and let us know if you need any further information or clarification. If you encounter any blockers, don't hesitate to reach out.</p>
        <p>We appreciate your attention to this task and look forward to your updates.</p>
        <p>Best regards, <br> AppTestify Platform</p>
    </div>
</body>
</html>
`;
