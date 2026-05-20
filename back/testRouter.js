require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Conectado ao MongoDB Atlas"))
  .catch(err => console.error("Erro de conexão:", err));

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});