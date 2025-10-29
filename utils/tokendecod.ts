// tokendecod.ts
export const decodeTokens = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) {
      throw new Error("JWT mal formé : il manque des parties");
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    let base64Padded = base64;
    if (base64.length % 4 !== 0) {
      base64Padded += "=".repeat(4 - (base64.length % 4));
    }

    const jsonPayload = decodeURIComponent(
      atob(base64Padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erreur lors du décodage du JWT : ", e);
    return null;
  }
};
