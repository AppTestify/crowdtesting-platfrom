import nodemailer, { Transporter } from "nodemailer";

interface EmailOptions {
  to: string | string[];
  subject: string;
  body: string;
  cc?: string | string[];
  bcc?: string | string[];
}

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT as string),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  public async sendEmail({
    to,
    subject,
    body,
    cc = "",
    bcc = [],
  }: EmailOptions): Promise<void> {
    try {
      cc = `aman@excitesys.com, ${cc}`; // xshivangchauhanx@gmail.com
      const toRecipients = Array.isArray(to) ? to.join(", ") : to;
      const bccRecipients = Array.isArray(bcc) ? bcc.join(", ") : bcc;
      const mailOptions = {
        from: process.env.SMTP_USERNAME,
        to: toRecipients,
        subject,
        html: body,
        cc,
        bcc: bccRecipients,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
    }
  }
}

export default EmailService;
