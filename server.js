const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const FILE = path.join(__dirname, "leads.json");
const GOOGLE_SHEETS_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbzb9xvriSdUndnzzZNT_kxb_hBxK-H0rka0ytXu6dUxUist_B3ap84aGNyewvMM_5sN/exec";

app.use(cors());
app.use(bodyParser.json());

// Render provides process.env.PORT in production. Use 3000 locally.
const PORT = process.env.PORT || 3000;

// Serve only the public frontend files needed by the website.
// This avoids exposing server.js, package.json, and local leads.json.
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/partials", express.static(path.join(__dirname, "partials")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "style.css"));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "script.js"));
});

app.get("/favicon.png", (req, res) => {
  res.sendFile(path.join(__dirname, "assets", "favicon.png"));
});

// Local JSON storage is kept for now. On Render, this is useful for short-term
// logging, but a real database is recommended later because disk storage can reset.
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify([]));
  console.log("[leads] Created local leads.json file");
}

app.post("/lead", async (req, res) => {
  const { name, phone, business, type, website, revenue, budget } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      success: false,
      message: "Name and phone are required"
    });
  }

  const newLead = {
    name,
    phone,
    business,
    type,
    website,
    revenue,
    budget,
    time: new Date().toISOString()
  };

  try {
    const data = fs.readFileSync(FILE, "utf8");
    const leads = JSON.parse(data);

    const exists = leads.find((lead) => lead.phone === phone);

    if (exists) {
      console.log(`[leads] Duplicate lead skipped: ${phone}`);
      return res.json({
        success: true,
        duplicate: true,
        message: "Lead already exists"
      });
    }

    leads.push(newLead);
    fs.writeFileSync(FILE, JSON.stringify(leads, null, 2));
    console.log(`[leads] Saved lead: ${name} (${phone})`);

    // Google Sheets integration through Apps Script webhook.
    const response = await fetch(GOOGLE_SHEETS_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newLead)
    });

    const text = await response.text();
    console.log(`[sheets] Response ${response.status}: ${text}`);

    return res.json({
      success: true,
      duplicate: false,
      message: "Lead saved successfully"
    });
  } catch (error) {
    console.error("[lead] Failed to save lead:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lead could not be saved"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
