import { GENERIC_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import EmailService from "@/app/_helpers/email.helper";
import { ACTIVATE_ACOUNT_LINK_TEMPLATE } from "@/email-templates/activate-account-link.template";

export async function POST(req: Request) {
  try {
    const emailService = new EmailService();

    const response = await emailService.sendEmail({
      to: "shivang@excitesys.com",
      subject: "Test Subject",
      body: ACTIVATE_ACOUNT_LINK_TEMPLATE,
    });
    return Response.json({
      message: "Email sent successfully",
      response
    });
  } catch (error: any) {
    return Response.json(
      { message: GENERIC_ERROR_MESSAGE },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
