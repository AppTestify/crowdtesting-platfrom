import { AuthIntent } from "@/app/_constants";
import {
  SIGN_IN_GOOGLE_ENDPOINT,
  SIGN_UP_GOOGLE_ENDPOINT,
} from "@/app/_constants/api-endpoints";
import { CookieKey } from "@/app/_constants/cookie-keys";
import { UserRoles } from "@/app/_constants/user-roles";
import { createSession } from "@/app/_lib/session";
import { Website } from "@/app/_models/website.model";
import { signInService, signUpService } from "@/app/_services/auth-service";
import { genericPost } from "@/app/_services/generic-api-methods";
import { getUserByEmailService } from "@/app/_services/user.service";
import { sendSignUpEmailToAdmin } from "@/app/_utils/email";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "" },
        password: { label: "Password", type: "password" },
        authIntent: { label: "authIntent", type: "text" },
      },
      async authorize(credentials, req) {
        return handleAuthorization(credentials);
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      return handleSignIn(user);
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      session.user.id = token.id;
      const dbUser = await getUserByEmailService(session?.user?.email);
      if (!dbUser) {
        redirect("/auth/sign-in");
      }
      const website = await Website.find({}).lean();
      session.user = { ...dbUser, ...session.user };
      session.website = { ...website };
      return { ...session };
    },
  },
});

const handleSignIn = async (user: any) => {
  if (!user) {
    return false;
  }

  const cookieStore = cookies();
  const authIntent: RequestCookie | undefined = cookieStore.get(
    CookieKey.AUTH_INTENT
  );
  const activeRole: RequestCookie | undefined = cookieStore.get(CookieKey.ROLE);
  const intent = authIntent?.value ?? AuthIntent.SIGN_IN;
  const role = activeRole?.value ?? UserRoles.TESTER;

  if (intent === AuthIntent.SIGN_IN) {
    return await createSessionAndSignInUser(user);
  } else if (intent === AuthIntent.SIGN_UP) {
    return await createUserAndSession({ ...user, role: role });
  } else {
    await createSession(user);
    return user;
  }
};

const createSessionAndSignInUser = async (user: any) => {
  try {
    const { email } = user;

    const response = await genericPost(
      `${process.env.URL}/${SIGN_IN_GOOGLE_ENDPOINT}`,
      { email }
    );

    if (!response?.user) {
      return true;
    }

    await createSession(response?.user);
    return true;
  } catch (error) {
    return true;
  }
};

const createUserAndSession = async (user: any) => {
  try {
    const { name, email, role } = user;
    const [firstName, lastName] = name ? name.split(" ") : ["", ""];

    const response = await genericPost(
      `${process.env.URL}/${SIGN_UP_GOOGLE_ENDPOINT}`,
      {
        email,
        firstName,
        lastName,
        role: role,
      }
    );

    if (!response?.user) {
      return true;
    }

    await createSession(response?.user);
    return true;
  } catch (error) {
    return true;
  }
};

const handleAuthorization = async (credentials: any) => {
  if (credentials?.authIntent === AuthIntent.SIGN_IN_CREDS) {
    const response = await signInService({
      email: credentials?.email || "",
      password: credentials?.password || "",
    });
    if (response?.user) {
      return response.user;
    } else {
      return null;
    }
  } else {
    const cookieStore = cookies();
    const activeRole: RequestCookie | undefined = cookieStore.get(
      CookieKey.ROLE
    );
    const role = activeRole?.value ?? UserRoles.TESTER;

    const response = await signUpService({
      email: credentials?.email || "",
      password: credentials?.password || "",
      role: role,
    });
    if (response?.user) {
      const adminUsers = await Website.findOne();
      sendSignUpEmailToAdmin(response?.user as any, adminUsers?.emails);

      return response.user;
    } else {
      return null;
    }
  }
};

export { handler as GET, handler as POST };
