import { GENERIC_ERROR_MESSAGE } from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import EmailService from "@/app/_helpers/email.helper";
import { welcomeClientMail } from "@/app/_utils/email";
import { ACTIVATE_ACOUNT_LINK_TEMPLATE } from "@/email-templates/activate-account-link.template";

export async function POST(req: Request) {
  try {
    const emailService = new EmailService();

    await welcomeClientMail({
      email: "shivang@excitesys.com",
      name: "Shivang chauhan",
      link: `${process.env.URL}/auth/sign-in`,
    });
    return Response.json({
      message: "Email sent successfully",
    });
  } catch (error: any) {
    console.log(error)
    return Response.json(
      { message: GENERIC_ERROR_MESSAGE },
      { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
}
