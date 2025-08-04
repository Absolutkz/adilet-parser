const express = require("express");
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const app = express();
app.use(express.json());

app.post("/fetch", async (req, res) => {
  const { docId, article } = req.body;
  if (!docId || !article) {
    return res.status(400).json({ error: "docId и article обязательны" });
  }
  try {
    const url = `https://adilet.zan.kz/rus/docs/V${docId}#zp${article}`;
    const html = await fetch(url).then(r => r.text());
    const dom = new JSDOM(html);
    const text = Array.from(dom.window.document.querySelectorAll(`#zp${article} p`))
                      .map(p => p.textContent.trim()).join("\n\n");
    const timeEl = dom.window.document.querySelector("time[datetime]");
    const date = timeEl?.getAttribute("datetime") || null;
    res.json({ text, date, url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Не удалось спарсить статью" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`Listening on ${port}`));
