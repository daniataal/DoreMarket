import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnAdmin = nextUrl.pathname.startsWith("/admin");

            if (isOnAdmin) {
                if (isLoggedIn && auth?.user?.role === 'ADMIN') return true;
                return false; // Redirect to login if not admin
            }

            // For now, let's protect the dashboard and settings
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect to login
            } else if (isLoggedIn) {
                // If logged in and on login/register page, redirect to dashboard
                if (nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register")) {
                    return Response.redirect(new URL("/dashboard", nextUrl));
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                session.user.role = token.role as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user && user.id) {
                token.sub = user.id;
                token.role = user.role;
            }
            return token;
        }
    },
    providers: [], // Add providers with an outer function
    secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
