require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const UserController = require("./controllers/UserController");
const PetController = require("./controllers/PetController");
const ReservationController = require("./controllers/ReservationController");
const TutorController = require("./controllers/TutorController");

const app = express();

app.use(cors()); 
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Conectado ao MongoDB Atlas");
    })
    .catch((err) => {
        console.error("Erro de conexão MongoDB:", err);
    });

// ROTAS DE USUÁRIO

app.get("/users/:id", async (req, res) => {
  try {
    const user = await UserController.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
        const user = await UserController.activeToggle(req.body.id);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put("/users/admin", async (req, res) => {
    try {
        const user = await UserController.adminToggle(req.body.id);
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ROTAS DE TUTORES

app.get("/tutors", async (req, res) => {
    try {
        const tutors = await TutorController.findAll();
        res.json(tutors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/tutors", async (req, res) => {
    try {
        const tutor = await TutorController.insertOne(req.body);
        res.status(201).json(tutor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put("/tutors", async (req, res) => {
    try {
        const tutor = await TutorController.update(req.body);
        res.json(tutor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put("/tutors/active", async (req, res) => {
    try {
        const tutor = await TutorController.activeToggle(req.body.id);
        res.json(tutor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ROTAS DE PETS

app.get("/pets", async (req, res) => {
    try {
        const pets = await PetController.findAll();
        res.json(pets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/pets/search", async (req, res) => {
    try {
        const pets = await PetController.search(req.query.q);
        res.json(pets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/pets/complete-create", async (req, res) => {
    try {
        const pet = await PetController.insertOne(req.body);
        res.status(201).json(pet);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post("/pets/quick-create", async (req, res) => {
    try {
        const pet = await PetController.quickCreate(req.body);
        res.status(201).json(pet);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put("/pets", async (req, res) => {
    try {
        const pet = await PetController.update(req.body);
        res.json(pet);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put("/pets/active", async (req, res) => {
    try {
        const pet = await PetController.activeToggle(req.body.id);
        res.json(pet);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ROTAS DE RESERVAS

app.get("/reservations", async (req, res) => {
    try {
        const reservations = await ReservationController.findAll();
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/reservations", async (req, res) => {
    try {
        const reservation = await ReservationController.insertOne(req.body);
        res.status(201).json(reservation);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

app.put("/reservations", async (req, res) => {
    try {
        const reservation = await ReservationController.update(req.body);
        res.json(reservation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put("/reservations/active", async (req, res) => {
    try {
        const reservation = await ReservationController.activeToggle(req.body.id);
        res.json(reservation);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// HEALTH CHECK & INICIALIZAÇÃO

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API funcionando"
    });
});

app.listen(3000, () => {
  console.log("🚀 Servidor rodando na porta 3000");
});