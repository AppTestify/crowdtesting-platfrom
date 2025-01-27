export const DOCUMENT_APPROVAL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Approval Request</title>
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
        .document-details {
            background-color: #f9f9f9;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .approve-button {
            display: inline-block;
            padding: 12px 25px;
            background-color: #4CAF50;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
            margin-top: 10px;
            margin-bottom: 10px;
        }
        .approve-button:hover {
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
    </style>
</head>
<body>
    <div class="container">
        <h1>Document Approval Request</h1>
        <p>A new document requires your approval. Please find the details below:</p>
        
        <div class="document-details">
            <p>
            <strong>{documentName}</strong>
             ({documentType}) 
            document send by 
            <strong>{firstName} {lastName}</strong>
            </p>
        </div>
        
        <p>Click the button below to view or approve the document:</p>
        <a href="{link}" class="approve-button">View Document</a>
        
        <p>If you have any questions or need further assistance, please contact support.</p>
        
        </div>
</body>
</html>
`;
