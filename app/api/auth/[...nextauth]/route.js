import { connectdb } from "../../../../lib/connectdb";
import Auth from "../../../../models/authModel";
import CredentialAuth from "../../../../models/credentialAuthModel";
import userIntroModel from "../../../../models/userIntroModel";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectdb();

        const user = await CredentialAuth.findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ profile, account }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email) return false;

      await connectdb();

      const existingUser = await Auth.findOne({ email: profile.email });

      if (!existingUser) {
        await Auth.create({
          name: profile.name,
          email: profile.email,
          photo: profile.picture,
        });
      } else {
        await Auth.updateOne(
          { email: profile.email },
          { photo: profile.picture }
        );
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // first time credentials login
      if (account?.provider === "credentials" && user) {
        token.userId = user.id;
        token.isNewUser = false;
        token.isNewUserChecked = true;

        await connectdb();
        const introData = await userIntroModel.findOne({ userId: user.id });
        token.hasIntro = !!introData;

        return token;
      }

      if (!token.email) return token;

      await connectdb();

      const dbUser = await Auth.findOne({ email: token.email });

      if (dbUser) {
        token.userId = dbUser._id.toString();
        token.photo = dbUser.photo ?? null;

        if (!token.isNewUserChecked) {
          if (dbUser.createdAt?.getTime() === dbUser.updatedAt?.getTime()) {
            token.isNewUser = true;
          }
          token.isNewUserChecked = true;
        }

        const introData = await userIntroModel.findOne({
          userId: dbUser._id.toString(),
        });
        token.hasIntro = !!introData;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.id = token.userId;
        session.user.isNewUser = token.isNewUser ?? false;
        session.user.hasIntro = token.hasIntro ?? false;
        session.user.photo = token.photo ?? null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };