import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      // Chemin vers votre fichier JSON
      const filePath = path.join(process.cwd(), "data", "users.json");

      // Lire les données du fichier JSON
      const fileData = fs.readFileSync(filePath, "utf8");
      const users = JSON.parse(fileData);

      // Renvoyer les utilisateurs sous forme de réponse JSON
      res.status(200).json(users);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur lors du chargement des utilisateurs", error });
    }
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
}
