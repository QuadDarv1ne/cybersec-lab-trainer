import { NextResponse } from "next/server";

/**
 * Expose available auth providers to the client.
 * The signin page uses this to conditionally render buttons.
 */
export async function GET() {
  const hasGitHub = !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET);
  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  const providers: string[] = [];
  if (hasGitHub) providers.push("github");
  if (hasGoogle) providers.push("google");

  // If no OAuth providers, client should show a demo/continue option
  const demoMode = providers.length === 0;

  return NextResponse.json({ providers, demoMode });
}
