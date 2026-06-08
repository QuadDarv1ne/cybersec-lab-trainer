import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname;

      // /app/admin only for ADMIN
      if (path.startsWith('/app/admin') && token?.role !== 'ADMIN') {
        return false;
      }
      // /app/teacher only for TEACHER and ADMIN
      if (path.startsWith('/app/teacher') && token?.role !== 'TEACHER' && token?.role !== 'ADMIN') {
        return false;
      }

      // /app/* requires any authenticated user
      if (path.startsWith('/app/')) {
        return !!token;
      }

      return true;
    },
  },
});

// API routes (/api/*) intentionally excluded — auth is handled per-route
// via getServerSession() for flexibility (e.g., glossary-search is public).
export const config = {
  matcher: ['/app/:path*'],
};
