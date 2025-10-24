import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

interface AppUser {
  id: string;
  name: string;
  email: string;
}

export const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials): Promise<AppUser | null> {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_NEST_API_URL}/api/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(credentials),
            }
          );

          if (!res.ok) return null;

          const user: AppUser = await res.json();
          if (!user || !user.email) return null;

          return user;
        } catch (err) {
          console.error("Login error:", err);
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user; // store your AppUser in the JWT
      return token;
    },
    async session({ session, token }) {
      // session.user now has id, name, email
      session.user = token.user as AppUser;
      return session;
    },
  },
});

export { handler as GET, handler as POST };


// // app/api/auth/[...nextauth]/route.ts
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";

// export const handler = NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: { email: {}, password: {} },
//       async authorize(credentials) {
//         console.log(process.env.NEXT_PUBLIC_NEST_API_URL)
//         try {
//           const res = await fetch(`${process.env.NEXT_PUBLIC_NEST_API_URL}/api/auth/login`, {
//             method: "POST",
//             body: JSON.stringify(credentials),
//             headers: { "Content-Type": "application/json" },
//           });
      
//           if (!res.ok) {
//             const err = await res.json();
//             console.error("Backend login failed:", err);
//             return null;
//           }
      
//           const user = await res.json();
//           if (!user || !user.email) return null; // make sure NextAuth has user.email
      
//           return user; 
//         } catch (err) {
//           console.error("Login error:", err);
//           return null;
//         }
//       },
//     }),
//   ],
//   session: { strategy: "jwt" },
// });

// export { handler as GET, handler as POST };



// // import NextAuth, { type NextAuthOptions } from "next-auth";
// // import CredentialsProvider from "next-auth/providers/credentials";

// // interface AppUser {
// //   id: string;
// //   name: string;
// //   email: string;
// // }

// // const authOptions: NextAuthOptions = {
// //   providers: [
// //     CredentialsProvider({
// //       name: "Credentials",
// //       credentials: {
// //         email: { label: "Email", type: "text" },
// //         password: { label: "Password", type: "password" },
// //       },
// //       async authorize(credentials): Promise<AppUser | null> {
// //         const res = await fetch(`${process.env.NEST_API_URL}/auth/login`, {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({
// //             email: credentials?.email,
// //             password: credentials?.password,
// //           }),
// //         });

// //         if (!res.ok) return null;

// //         const user: AppUser = await res.json();
// //         return user ?? null;
// //       },
// //     }),
// //   ],
// //   pages: {
// //     signIn: "/login",
// //   },
// //   session: {
// //     strategy: "jwt",
// //   },
// //   callbacks: {
// //     async jwt({ token, user }) {
// //       if (user) token.user = user; // user is AppUser
// //       return token;
// //     },
// //     async session({ session, token }) {
// //       // 👇 Explicitly cast token.user as AppUser
// //       session.user = token.user as AppUser;
// //       return session;
// //     },
// //   },
// // };

// // const handler = NextAuth(authOptions);
// // export { handler as GET, handler as POST };
