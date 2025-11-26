// api/bluesky.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  const feedUri = req.query.feed || "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot";
  const limit = req.query.limit || 30;

  const url = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.getFeed");
  url.searchParams.set("feed", feedUri);
  url.searchParams.set("limit", limit);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return res.status(response.status).send(await response.text());
    const data = await response.json();
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate");
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

