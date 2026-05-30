import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

// API routes (/api/*) intentionally excluded — auth is handled per-route
// via getServerSession() for flexibility (e.g., glossary-search is public).
export const config = {
  matcher: ['/app/:path*'],
};