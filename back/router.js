require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const UserController = require("./controllers/UserController");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Conectado ao MongoDB Atlas"))
  .catch(err => console.error("Erro de conexão:", err));

app.listen(3000, () => {
  console.log("🚀 Servidor rodando");
});

// ROTAS DE USUÁRIO

app.get("/users", async (req, res) => {
  try {
    const users = await UserController.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = await UserController.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/users/login", async (req, res) => {
  try {
    const user = await UserController.login(req.body);
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.put("/users", async (req, res) => {
  try {
    const user = await UserController.update(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/users/active", async (req, res) => {
  try {
    const user = await UserController.activeToggle(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/users/admin", async (req, res) => {
  try {
    const user = await UserController.adminToggle(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});