import { ACTIVATE_ACOUNT_LINK_TEMPLATE } from "@/email-templates/activate-account-link.template";
import EmailService from "../_helpers/email.helper";
import { EmailSubjects } from "../_constants/email-subject";
import { generateVerificationLink } from "./common-server-side";
import {
  IClientWelcomePayload,
  INewUser,
  IUserCredentialsEmail,
} from "../_interface/user";
import { SEND_CREDENTIALS_TEMPLATE } from "@/email-templates/send-credentials.template";
import { IForgotPasswordPayload } from "../_interface/auth";
import { FORGOT_PASSWORD_TEMPLATE } from "@/email-templates/forgot-password.template";
import { NEW_USER_ADDED_TEMPLATE } from "@/email-templates/new-user.template";
import { DOCUMENT_APPROVAL_TEMPLATE } from "@/email-templates/document-approval.template";
import { IDocumentApprovalPayload } from "../_interface/document";
import { WELCOME_CLIENT_MESSAGE_TEMPLATE } from "@/email-templates/welcome-client.template";
import { WELCOME_TESTER_MESSAGE_TEMPLATE } from "@/email-templates/welcome-tester.template";
import { PARENT_EMAIL_TEMPLATE } from "@/email-templates/parent.template";
import { TESTER_INFORMATION_TEMPLATE } from "@/email-templates/tester-information.template";

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

export const prepareEmailTemplate = (mainContent: string) => {
  return replaceEmailTemplateTagsInternalService({
    emailBody: PARENT_EMAIL_TEMPLATE,
    tagValuesObject: { mainContent },
  });
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

export const sendCredentialsEmail = async (
  templateTags: IUserCredentialsEmail
) => {
  const emailService = new EmailService();

  await emailService.sendEmail({
    to: templateTags?.email,
    subject: EmailSubjects.SEND_CREDENTIALS,
    body: replaceEmailTemplateTagsInternalService({
      emailBody: SEND_CREDENTIALS_TEMPLATE,
      tagValuesObject: templateTags,
    }),
  });
};

export const sendSignUpEmailToAdmin = async (
  templateTags: INewUser,
  emails: string[]
) => {
  const emailService = new EmailService();

  emailService.sendEmail({
    to: emails,
    subject: EmailSubjects.NEW_USER_ADDED,
    body: replaceEmailTemplateTagsInternalService({
      emailBody: NEW_USER_ADDED_TEMPLATE,
      tagValuesObject: templateTags,
    }),
  });
};

export const sendForgotPasswordLink = async (
  templateTags: IForgotPasswordPayload
) => {
  const emailService = new EmailService();
  await emailService.sendEmail({
    to: templateTags?.email,
    subject: EmailSubjects.FORGOT_PASSWORD,
    body: replaceEmailTemplateTagsInternalService({
      emailBody: FORGOT_PASSWORD_TEMPLATE,
      tagValuesObject: templateTags,
    }),
  });
};

export const sendDocumentApprovalMail = async (
  templateTags: IDocumentApprovalPayload
) => {
  const emailService = new EmailService();
  await emailService.sendEmail({
    to: templateTags?.emails,
    subject: EmailSubjects.DOCUMENT_APPROVAL,
    body: replaceEmailTemplateTagsInternalService({
      emailBody: DOCUMENT_APPROVAL_TEMPLATE,
      tagValuesObject: templateTags,
    }),
  });
};

export const welcomeClientMail = async (
  templateTags: IClientWelcomePayload
) => {
  const emailService = new EmailService();
  await emailService.sendEmail({
    to: templateTags?.email,
    subject: EmailSubjects.CLIENT_SIGN_UP,
    body: replaceEmailTemplateTagsInternalService({
      emailBody: prepareEmailTemplate(WELCOME_CLIENT_MESSAGE_TEMPLATE),
      tagValuesObject: templateTags,
    }),
  });
};

export const welcomeTesterMail = async (
  templateTags: IClientWelcomePayload
) => {
  const emailService = new EmailService();
  await emailService.sendEmail({
    to: templateTags?.email,
    subject: EmailSubjects.TESTER_SIGN_UP,
    body: replaceEmailTemplateTagsInternalService({
      emailBody: prepareEmailTemplate(WELCOME_TESTER_MESSAGE_TEMPLATE),
      tagValuesObject: templateTags,
    }),
  });
};

export const testerInformationMail = async (
  templateTags: IClientWelcomePayload
) => {
  const emailService = new EmailService();
  await emailService.sendEmail({
    to: templateTags?.email,
    subject: EmailSubjects.TESTER_INFORMATION,
    body: replaceEmailTemplateTagsInternalService({
      emailBody: prepareEmailTemplate(TESTER_INFORMATION_TEMPLATE),
      tagValuesObject: templateTags,
    }),
  });
};
