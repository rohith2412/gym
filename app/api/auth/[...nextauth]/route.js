export const dynamic = "force-dynamic"

import { connectdb } from "../../../../lib/connectdb";
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

      // Google web login resolves against the SAME CredentialAuth
      // collection mobile's /api/auth/google + email/password login
      // already use, instead of the legacy Auth collection. Before this,
      // someone signing in with Google on web and password (or Google)
      // on mobile with the same email ended up with two entirely
      // separate accounts -- two different userIds, so their food log /
      // workouts / everything logged on one side was invisible on the
      // other. CredentialAuth requires a password, so a brand-new Google
      // user gets a random unusable hash, same pattern the mobile REST
      // route already uses.
      const existingUser = await CredentialAuth.findOne({ email: profile.email });

      if (!existingUser) {
        const randomPassword = await bcrypt.hash(
          `google-web:${profile.email}:${Date.now()}`,
          10
        );
        await CredentialAuth.create({
          name: profile.name || profile.email.split("@")[0],
          email: profile.email,
          password: randomPassword,
        });
      }
      // No update-on-existing branch: CredentialAuth has no `photo`
      // field (mobile's Google login never persisted one either) --
      // the profile picture is passed through the session below
      // without being stored in the DB.

      return true;
    },

    async jwt({ token, user, account, profile }) {
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

      // Google's own profile picture arrives fresh on every sign-in
      // (account/profile only present on that initial call, never on
      // later silent token refreshes) -- capture it into the token so
      // it survives for the rest of the session without needing a
      // photo field on CredentialAuth.
      if (profile?.picture) token.photo = profile.picture;

      if (!token.email) return token;

      await connectdb();

      const dbUser = await CredentialAuth.findOne({ email: token.email });

      if (dbUser) {
        token.userId = dbUser._id.toString();

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