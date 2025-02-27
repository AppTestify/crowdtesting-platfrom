import { EmailSubjects } from "@/app/_constants/email-subject";
import {
  DB_CONNECTION_ERROR_MESSAGE,
  USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE,
} from "@/app/_constants/errors";
import { HttpStatusCode } from "@/app/_constants/http-status-code";
import { connectDatabase } from "@/app/_db";
import { verifySession } from "@/app/_lib/dal";
import { errorHandler } from "@/app/_utils/error-handler";
import { TEST_CYCLE_COUNTRY_TEMPLATE } from "@/email-templates/test-cycle-country.template";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await verifySession();
    if (!session || !session.isAuth) {
      return Response.json(
        { message: USER_UNAUTHORIZED_SERVER_ERROR_MESSAGE },
        { status: HttpStatusCode.UNAUTHORIZED }
      );
    }

    const isDBConnected = await connectDatabase();
    if (!isDBConnected) {
      return Response.json(
        {
          message: DB_CONNECTION_ERROR_MESSAGE,
        },
        { status: HttpStatusCode.INTERNAL_SERVER_ERROR }
      );
    }

    const response = {
      subject: EmailSubjects.TEST_CYCLE_COUNTRY,
      body: `<div>
        <p>Dear {fullName},</p>

        <p>We're excited to announce that a new testing cycle for <strong>{name}</strong> is now live, and we'd love for you to participate!</p>

        <div class="details">
            <p><strong>Test Start Date:</strong> {startDate}</p>
            <p><strong>Test End Date:</strong> {endDate}</p>
            <p><strong>Scope:</strong> {description}</p>
            <p><strong>Key Areas of Focus:</strong> {country}</p>
        </div>

        <p>To confirm your participation, please click the link below to join this test cycle:</p>
        <a href="{applyLink}" class="button">Confirm Participation</a>

        <p>Once you confirm, you can access the full test details and start testing.</p>
        
        <p><strong>Important:</strong> If you encounter any issues or have questions during the test, feel free to reach out to us at <a href="mailto:contact@apptestify.com">contact@apptestify.com</a>.</p>
        
        <p>Thank you for your continued support and participation. Your feedback is crucial to the success of this project.</p>
        
        <p>We look forward to having you on board!</p>

        <p>Best regards,<br>AppTestify Platform</p>
    </div>`,
    };

    return Response.json(response);
  } catch (error: any) {
    return errorHandler(error);
  }
}
