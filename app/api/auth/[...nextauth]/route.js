import { connectdb } from "../../../../lib/connectdb";
import Auth from "../../../../models/authModel";
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
          email: profile.email,
        });
      }

      return true;
    },

    async jwt({ token }) {
      if (!token.email) return token;

      await connectdb();

      const dbUser = await Auth.findOne({ email: token.email });

      if (dbUser) {
        // Store the user's MongoDB _id in the token
        token.userId = dbUser._id.toString();

        // Check if this is a new user (only on first check)
        if (!token.isNewUserChecked) {
          if (dbUser.createdAt?.getTime() === dbUser.updatedAt?.getTime()) {
            token.isNewUser = true;
          }
          token.isNewUserChecked = true;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.id = token.userId; // Add user ID to session
        session.user.isNewUser = token.isNewUser ?? false;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };