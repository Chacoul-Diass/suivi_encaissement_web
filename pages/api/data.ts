// pages/api/data.ts

import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "data.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const data = fs.readFileSync(DATA_FILE_PATH, "utf8");
      const parsedData = JSON.parse(data);
      res.status(200).json(parsedData);
    } catch (error: any) {
      res
        .status(500)
        .json({
          message: "Erreur lors de la lecture du fichier",
          error: error.message,
        });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Méthode ${req.method} non autorisée` });
  }
}
