import { ACTIVATE_ACOUNT_LINK_TEMPLATE } from "@/email-templates/activate-account-link.template";
import EmailService from "../_helpers/email.helper";
import { EmailSubjects } from "../_constants/email-subject";
import { generateVerificationLink } from "./common-server-side";

interface IReplaceTemplateTags {
  tagValuesObject: any;
  emailBody: string;
}

const replaceTags = (
  emailBody: string,
  tagValuesObject: Record<string, any>
): string => {
  const replacedEmailBody = emailBody.replace(
    /\{(\w+)\}/g,
    (match, tagName) => {
      return tagValuesObject[tagName] !== undefined
        ? tagValuesObject[tagName]
        : "";
    }
  );

  return replacedEmailBody;
};

export const replaceEmailTemplateTagsInternalService = (
  params: IReplaceTemplateTags
) => {
  try {
    const { tagValuesObject, emailBody } = params;
    const replacedEmailBody = replaceTags(emailBody, tagValuesObject);

    return replacedEmailBody;
  } catch (error: any) {
    throw error;
  }
};

export const sendVerificationEmail = async (user: any) => {
  const emailService = new EmailService();

  const templateTags = {
    accountActivationLink: generateVerificationLink(user._id),
  };
  emailService.sendEmail({
    to: user.email,
    subject: EmailSubjects.VERIFICATION_MAIL,
    body: replaceEmailTemplateTagsInternalService({
      emailBody: ACTIVATE_ACOUNT_LINK_TEMPLATE,
      tagValuesObject: templateTags,
    }),
  });
};
