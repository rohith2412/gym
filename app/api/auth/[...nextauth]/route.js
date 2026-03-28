import { connectdb } from "../../../../lib/connectdb";
import Auth from "../../../../models/authModel";
import userIntroModel from "../../../../models/userIntroModel";
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
    maxAge: 30 * 24 * 60 * 60, 
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
          photo: profile.picture,   
        });
      } else {
        await Auth.updateOne({ email: profile.email }, { photo: profile.picture });
      }

      return true;
    },

    async jwt({ token }) {
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

        // Check if the user has completed intro — re-check on every jwt call
        // so it updates immediately after they submit the intro form.
        const introData = await userIntroModel.findOne({ userId: dbUser._id.toString() });
        token.hasIntro = !!introData;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email;
        session.user.id = token.userId;
        session.user.isNewUser = token.isNewUser ?? false;
        session.user.hasIntro = token.hasIntro ?? false; // ← available on client
        session.user.photo = token.photo ?? null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };