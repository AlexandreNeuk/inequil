const express = require("express");

const PORT = process.env.PORT || '3000';
const app = express();

app.get("/hello", (req, res) => {
  res.send("Hello world");
})

app.get("/", (req, res) => {
  res.send("Teste");
})

app.listen(PORT, () => {
 console.log(`Server is listening on port: ${PORT}`);
})