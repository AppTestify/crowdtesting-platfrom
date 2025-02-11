import { generateCustomPassword } from "../_utils/common-server-side";
import bcrypt from "bcryptjs";
import { sendCredentialsEmail } from "../_utils/email";

interface EmailCredentials {
  email: string;
  role: string;
  sendCredentials: boolean;
}

class SendCredentials {
  public async sendEmailCredentials({
    email,
    role,
    sendCredentials,
  }: EmailCredentials) {
    try {
      const password = generateCustomPassword();
      if (sendCredentials && password) {
        const templateTags = {
          email: email,
          role: role,
          password: password,
          link: process.env.NEXTAUTH_URL + "/auth/sign-in",
        };
        await sendCredentialsEmail(templateTags);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  }
}

export default SendCredentials;
