import { connectdb } from "@/lib/connectdb";
import Auth from "@/models/authModel";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    }),
  ],

   session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) return false;

      await connectdb();

      const existingUser = await Auth.findOne({ email: profile.email });

      if (!existingUser) {
        await Auth.create({
          name: profile.name,
          email: profile.email
        });
      }

      return true;
    },

    async jwt({ token }) {
      if (!token.email) return token;

      if (!token.isNewUserChecked) {
        await connectdb();

        const dbUser = await Auth.findOne({ email: token.email });

        if (
          dbUser?.createdAt?.getTime() === dbUser?.updatedAt?.getTime()
        ) {
          token.isNewUser = true;
        }

        token.isNewUserChecked = true;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.isNewUser = token.isNewUser ?? false;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
