export const WELCOME_CLIENT_MESSAGE_TEMPLATE = ` 
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
        <p>Congratulations on joining AppTestify - the ultimate platform to elevate your software quality! We're thrilled to have you on board and can't wait to help you bring your vision to life.</p> 

        <p>Here's what awaits you:</p> 
        <ul> 
            <li>✅ Effortless Project Setup - Create projects, define goals, and assign test cycles in just a few clicks.</li> 
            <li>✅ Expert Testers at Your Fingertips - Access a network of skilled professionals who ensure comprehensive coverage.</li> 
            <li>✅ Data-Driven Insights - Stay on top of progress with detailed dashboards and real-time defect tracking.</li> 
        </ul> 

        <p>💡 Ready to Get Started?</p> 
        <p>Log in now and create your first project today:</p> 
        <a href="{link}" class="button">Log in to AppTestify</a> 

        <p>📚 Need assistance? Write to <a href="mailto:contact@appTestify.com">contact@appTestify.com</a>.</p> 

        <p>Let's work together to create software that's flawless and user-friendly. We're here every step of the way!</p> 

        <p>Cheers to a successful testing journey,</p> 
        <p class="highlight">The AppTestify Team</p> 
    </div>  
    </body> 
</html>
`;
