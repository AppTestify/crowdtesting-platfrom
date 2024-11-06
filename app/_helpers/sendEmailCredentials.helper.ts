import { generateCustomPassword } from "../_utils/common-server-side";
import bcrypt from "bcryptjs";
import { sendCredentialsEmail } from "../_utils/email";

interface EmailCredentials {
    email: string;
    role: string;
}

class SendCredentials {
    public async sendEmailCredentials({
        email,
        role,
    }: EmailCredentials) {
        try {
            const password = generateCustomPassword();
            const templateTags = {
                email: email,
                role: role,
                password: password
            }
            await sendCredentialsEmail(templateTags);
            const hashedPassword = await bcrypt.hash(password, 10);
            return hashedPassword;
        } catch (error) {
            throw error;
        }
    }
}

export default SendCredentials;