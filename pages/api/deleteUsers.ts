import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Path to the users.json file
const getUsersFilePath = () => path.join(process.cwd(), "data", "users.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const { id } = req.query; // Extract the user ID from the query string

    try {
      const filePath = getUsersFilePath();
      const fileData = fs.readFileSync(filePath, "utf-8");
      const users = JSON.parse(fileData);

      // Find and delete the user
      const updatedUsers = users.filter(
        (user: any) => user.id !== parseInt(id as string, 10)
      );

      // Save the updated users back to users.json
      fs.writeFileSync(filePath, JSON.stringify(updatedUsers, null, 2));

      return res
        .status(200)
        .json({ message: "Utilisateur supprimer avec succes" });
    } catch (error) {
      return res.status(500).json({ error: "FErreur lors de la suppression" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
