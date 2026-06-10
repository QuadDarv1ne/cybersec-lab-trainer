import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ req, token }) {
      const path = req.nextUrl.pathname;

      // /app/admin/* and /app/admin — only ADMIN
      if ((path.startsWith('/app/admin/') || path === '/app/admin') && token?.role !== 'ADMIN') {
        return false;
      }
      // /app/teacher/* and /app/teacher — only TEACHER and ADMIN
      if ((path.startsWith('/app/teacher/') || path === '/app/teacher') && token?.role !== 'TEACHER' && token?.role !== 'ADMIN') {
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
