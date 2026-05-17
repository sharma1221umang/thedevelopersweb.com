const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const FILE = "leads.json";

/* CREATE FILE IF NOT EXISTS */
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify([]));
}

/* IMPORT FETCH */

app.post("/lead", async (req, res) => {  
  const { name, phone, business, type, website, revenue, budget } = req.body;

  const newLead = {
    name,
    phone,
    time: new Date(),
    business,
    type,
    website,
    revenue,
    budget

  };

  try {
    // READ EXISTING DATA
    const data = fs.readFileSync(FILE);
    const leads = JSON.parse(data);

    // DUPLICATE CHECK
    const exists = leads.find(l => l.phone === phone);

    if (exists) {
      return res.json({ success: true, message: "Already exists" });
    }

    // SAVE LOCALLY
    leads.push(newLead);
    fs.writeFileSync(FILE, JSON.stringify(leads, null, 2));

    console.log("NEW LEAD SAVED:", newLead);

    const response = await fetch("https://script.google.com/macros/s/AKfycbzb9xvriSdUndnzzZNT_kxb_hBxK-H0rka0ytXu6dUxUist_B3ap84aGNyewvMM_5sN/exec", {
      method: "POST",
      headers: {
    "Content-Type": "application/json"
     },
      body: JSON.stringify(newLead)
    });

    const text = await response.text();
    console.log("GOOGLE RESPONSE:", text);

    res.json({ success: true });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
