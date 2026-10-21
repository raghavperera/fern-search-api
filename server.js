import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Fern Search API is running"
  });
});
app.get("/search", async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) {
    return res.status(400).json({
      error: "Enter something to search"
    });
  }
  if (!process.env.YDC_API_KEY) {
    return res.status(500).json({
      error: "Search API key is missing"
    });
  }
  try {
    const response = await fetch(
      "https://ydc-index.io/v1/search",
      {
        method: "POST",
        headers: {
          "X-API-Key": process.env.YDC_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: query,
          count: 10
        })
      }
    );
    if (!response.ok) {
      console.error("You.com API status:", response.status);
      return res.status(502).json({
        error: "Search provider error",
        status: response.status
      });
    }
    const data = await response.json();
    const results = (data.results?.web || []).map(item => ({
      title: item.title,
      url: item.url,
      description: item.description
    }));
    res.json({
      query,
      results
    });
  } catch (error) {
    console.error("Search failed:", error.message);
    res.status(500).json({
      error: "Something went wrong with the search"
    });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});