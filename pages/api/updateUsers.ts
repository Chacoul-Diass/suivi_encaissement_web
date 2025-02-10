import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Chemin vers le fichier users.json
const filePath = path.join(process.cwd(), "data", "users.json");

// Fonction pour lire le fichier JSON
const readUsersFile = () => {
  const fileData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileData);
};

// Fonction pour écrire dans le fichier JSON
const writeUsersFile = (data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, ...updatedUser } = req.body;

    // Lire le fichier users.json
    const users = readUsersFile();

    // Trouver l'utilisateur par email
    const userIndex = users.findIndex((user: any) => user.email === email);

    if (userIndex === -1) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Mettre à jour les informations de l'utilisateur
    users[userIndex] = { ...users[userIndex], ...updatedUser };

    // Écrire les modifications dans le fichier
    writeUsersFile(users);

    return res.status(200).json({
      message: "Utilisateur mis à jour avec succès",
      user: users[userIndex],
    });
  } else {
    res.status(405).json({ error: "Méthode non autorisée" });
  }
}
