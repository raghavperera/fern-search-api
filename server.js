import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Fern Search API is running"
  });
});

app.get("/search", (req, res) => {
  const query = req.query.q;

  if (!query || !query.trim()) {
    return res.status(400).json({
      error: "Enter a search query"
    });
  }

  const searchUrl =
    "https://www.google.com/search?q=" +
    encodeURIComponent(query);

  res.json({
    query,
    searchUrl
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});