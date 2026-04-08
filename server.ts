import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { format } from "date-fns";
import dotenv from "dotenv";
import matchesHandler from "./src/api/matches";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/matches", async (req, res) => {
    const dateStr = req.query.date as string || format(new Date(), "yyyy-MM-dd");

    try {
      // 새로 만든 matchesHandler를 호출하여 데이터를 가져옵니다.
      const results = await matchesHandler(dateStr);
      res.json(results);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "데이터를 가져오는 중 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
