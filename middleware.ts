import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("accessToken")?.value;
  const path = request.nextUrl.pathname;

  // Liste des chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = ["/login", "/forgot-password"];
  
  // Ignorer les requêtes RSC
  if (request.nextUrl.searchParams.has("_rsc")) {
    return NextResponse.next();
  }

  // Vérifier si le chemin actuel est public
  const isPublicPath = publicPaths.some((publicPath) =>
    path.startsWith(publicPath)
  );

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (!authToken && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est authentifié et essaie d'accéder à une route publique
  if (authToken && isPublicPath) {
    // Rediriger vers le dashboard par défaut
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Configuration des chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets
     */
    "/((?!api|_next/static|_next/image|assets|favicon.ico).*)",
  ],
};
