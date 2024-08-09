// Filename: app.js

const express = require('express');
const app = express();
const port = 3000;

app.get('/greet/:name', (req, res) => {
  res.send(`Hello ${req.params.name}! Hope you are doing good.`);
});

app.get('/age/:name', (req, res) => {
  // For simplicity, let's assume everyone is 25.
  res.send(`${req.params.name} is 25 years old.`);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});