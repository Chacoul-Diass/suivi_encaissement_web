import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("accessToken")?.value;
  const path = request.nextUrl.pathname;

  // Liste des chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = ["/login", "/forgot-password"];

  // Vérifier si le chemin actuel est public
  const isPublicPath = publicPaths.some((publicPath) =>
    path.startsWith(publicPath)
  );

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (!authToken && !isPublicPath) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Si l'utilisateur est authentifié et essaie d'accéder à une route publique
  if (authToken && isPublicPath) {
    // Rediriger vers le dashboard par défaut
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configuration des chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico).*)"],
};
