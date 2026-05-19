const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();

app.use(cors());

/*
  SCAN API
*/
app.get("/scan", (req, res) => {

  const ip = req.query.ip;

  if (!ip) {
    return res.status(400).json({
      error: "IP não informado"
    });
  }

  /*
    NMAP REAL
  */

  const command = `nmap -Pn -sV --top-ports 20 ${ip}`;

  exec(command, (error, stdout, stderr) => {

    if (error) {
      return res.status(500).json({
        error: error.message
      });
    }

    const ports = [];

    const lines = stdout.split("\n");

    for (const line of lines) {

      if (line.includes("/tcp")) {

        const parts = line.trim().split(/\s+/);

        ports.push({
          port: parts[0],
          state: parts[1],
          service: parts[2],
          version: parts.slice(3).join(" ")
        });
      }
    }

    res.json({
      target: ip,
      ports
    });
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API ONLINE ${PORT}`);
});