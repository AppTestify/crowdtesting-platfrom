export const PARENT_EMAIL_TEMPLATE = `<!doctype html>
<html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Simple Transactional Email</title>
    <style media="all" type="text/css">
    /* -------------------------------------
    GLOBAL RESETS
    ------------------------------------- */
    
    body {
      font-family: Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 16px;
      line-height: 1.3;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    
    table {
      border-collapse: separate;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      width: 100%;
    }
    
    table td {
      font-family: Helvetica, sans-serif;
      font-size: 16px;
      vertical-align: top;
    }
    /* -------------------------------------
    BODY & CONTAINER
    ------------------------------------- */
    
    body {
      background-color: #f4f5f6;
      margin: 0;
      padding: 0;
    }
    
    .body {
      background-color: #f4f5f6;
      width: 100%;
    }
    
    .container {
      margin: 0 auto !important;
      max-width: 600px;
      padding: 0;
      padding-top: 24px;
      width: 600px;
    }
    
    .content {
      box-sizing: border-box;
      display: block;
      margin: 0 auto;
      max-width: 600px;
      padding: 0;
    }

    .logo {
  max-width: 150px; /* Default size */
  width: 100%;
  height: auto;
  display: block;
}


    /* -------------------------------------
    HEADER, FOOTER, MAIN
    ------------------------------------- */

    .header {
    margin-top: 24px;
    }
        
    .main {
      background: #ffffff;
      border: 1px solid #eaebed;
      border-radius: 16px;
      width: 100%;
    }
    
    .wrapper {
      box-sizing: border-box;
      padding: 24px;
    }
    
    .footer {
      clear: both;
      padding-top: 15px;
      text-align: center;
      width: 100%;
      margin-bottom: 10px;
    }
    
    .footer td,
    .footer p,
    .footer span,
    .footer a {
      color: #9a9ea6;
      font-size: 16px;
      text-align: center;
    }
    /* -------------------------------------
    TYPOGRAPHY
    ------------------------------------- */
    
    p {
      font-family: Helvetica, sans-serif;
      font-size: 16px;
      font-weight: normal;
      margin: 0;
      margin-bottom: 16px;
    }
    
    a {
      color: #439D43;
      text-decoration: underline;
    }
    /* -------------------------------------
    BUTTONS
    ------------------------------------- */
    
    .btn {
      box-sizing: border-box;
      min-width: 100% !important;
      width: 100%;
    }
    
    .btn > tbody > tr > td {
      padding-bottom: 16px;
    }
    
    .btn table {
      width: auto;
    }
    
    .btn table td {
      background-color: #ffffff;
      border-radius: 4px;
      text-align: center;
    }
    
    .btn a {
      background-color: #ffffff;
      border: solid 2px #439D43;
      border-radius: 4px;
      box-sizing: border-box;
      color: #439D43;
      cursor: pointer;
      display: inline-block;
      font-size: 16px;
      font-weight: bold;
      margin: 0;
      padding: 0.5rem 1rem;
      text-decoration: none;
      text-transform: capitalize;
    }
    
    .btn-primary table td {
      background-color: #439D43;
    }
    
    .btn-primary a {
      background-color: #439D43;
      border-color: #439D43;
      color: #ffffff;
      cursor: pointer;
    }
    
    @media all {
      .btn-primary table td:hover {
        background-color: #419641 !important;
      }
      .btn-primary a:hover {
        background-color: #419641 !important;
        border-color: #419641 !important;
      }
    }

    @media only screen and (max-width: 640px) {
  .logo {
    max-width: 100px;
    width: auto;
    height: auto;
  }
}


    
    /* -------------------------------------
    OTHER STYLES THAT MIGHT BE USEFUL
    ------------------------------------- */
    
    .last {
      margin-bottom: 0;
    }
    
    .first {
      margin-top: 0;
    }
    
    .align-center {
      text-align: center;
    }
    
    .align-right {
      text-align: right;
    }
    
    .align-left {
      text-align: left;
    }
    
    .text-link {
      color: #439D43 !important;
      text-decoration: underline !important;
    }
    
    .clear {
      clear: both;
    }
    
    .mt0 {
      margin-top: 0;
    }
    
    .mb0 {
      margin-bottom: 0;
    }
    
    .preheader {
      color: transparent;
      display: none;
      height: 0;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      mso-hide: all;
      visibility: hidden;
      width: 0;
    }
    
    .powered-by a {
      text-decoration: none;
    }
    
    /* -------------------------------------
    RESPONSIVE AND MOBILE FRIENDLY STYLES
    ------------------------------------- */
    
    @media only screen and (max-width: 640px) {
      .main p,
      .main td,
      .main span {
        font-size: 14px !important; /* Reduce text size for better readability */
        line-height: 1.5 !important; /* Improve text clarity */
      }
      .wrapper {
        padding: 12px !important; /* Increase padding for better spacing */
      }
      .container {
        padding: 8px !important;
        padding-top: 16px !important; /* Adjust padding for better layout on mobile */
      }
      .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }
      .btn table {
        max-width: 100% !important;
        width: 100% !important;
      }
      .btn a {
        font-size: 14px !important; /* Adjust button text size */
        padding: 12px 16px !important; /* Adjust button padding for touch targets */
        width: 100% !important;
      }
     @media only screen and (max-width: 640px) {
  .logo {
    max-width: 100px; /* Smaller size for mobile */
    width: auto; /* Adjust to maintain aspect ratio */
    height: auto; /* Maintain the image's aspect ratio */
    display: block; /* Ensure the image is treated as a block element */
  }
}
      .footer {
        padding-top: 16px;
      }
      .footer td,
      .footer p {
        font-size: 14px !important; /* Smaller footer text */
      }
    }
    /* -------------------------------------
    PRESERVE THESE STYLES IN THE HEAD
    ------------------------------------- */
    
    @media all {
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
      .apple-link a {
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        text-decoration: none !important;
      }
      #MessageViewBody a {
        color: inherit;
        text-decoration: none;
        font-size: inherit;
        font-family: inherit;
        font-weight: inherit;
        line-height: inherit;
      }
    }
    </style>
  </head>
  <body>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
            <!-- START HEADER -->
                <div class="header">
                <img class="logo" src="https://platform.apptestify.com/assets/images/logo.png" alt="AppTestify Logo" />
                </div>
            <!-- END HEADER -->
          <div class="content">
            <!-- START CENTERED WHITE CONTAINER -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                   {mainContent}
                </td>
              </tr>
              <!-- END MAIN CONTENT AREA -->
            </table>
            </div>
            <!-- START FOOTER -->
            <div class="footer">
              &copy; APPTESTIFY GLOBAL SERVICES PRIVATE LIMITED | Corporate Identity Number: U74999DL2021PTC382674
            </div>
            <!-- END FOOTER -->
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
</html>
`;
