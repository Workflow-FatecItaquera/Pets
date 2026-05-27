import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { GridFSBucket } from "mongodb";

dotenv.config();

import UserController from "./controllers/UserController.js";
import PetController from "./controllers/PetController.js";
import ReservationController from "./controllers/ReservationController.js";
import TutorController from "./controllers/TutorController.js";
import LogController from "./controllers/LogController.js";

const app = express();

app.use(cors()); 
app.use(express.json({limit:"15mb"}));

let bucket;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Conectado ao MongoDB Atlas");

    
    const client = mongoose.connection.getClient();
    const db = client.db("pets"); 
    bucket = new GridFSBucket(db, { bucketName: "photos" });
    console.log("GridFSBucket inicializado");

    app.listen(3000, () => {
      console.log("🚀 Servidor rodando na porta 3000");
    });
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

app.get("/pets/:id/photo", async (req, res) => {
  try {
    if (!bucket) return res.status(500).send("Bucket não inicializado");

    const pet = await PetController.findById(req.params.id);
    if (!pet || !pet.photo) return res.status(404).send("Foto não encontrada");

    const downloadStream = bucket.openDownloadStream(pet.photo);

    downloadStream.on("error", (err) => {
      console.error("Erro ao baixar imagem:", err);
      res.status(500).send("Erro ao baixar imagem");
    });

    res.set("Content-Type", "image/jpeg");
    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro interno do servidor");
  }
});

app.post("/pets/quick-create", async (req, res) => {
  try {
    const { petName, tutorName, type, breed, size, temperament, allergies, phone, photo } = req.body;

    let photoId = null;

    if (photo) {
        let extension = "jpg";
        let mimeType = "image/jpeg";

        if (photo.startsWith("data:image")) {
            mimeType = photo.substring(photo.indexOf(":") + 1, photo.indexOf(";"));
            extension = mimeType.split("/")[1];
            
            photo = photo.split(",")[1];
        }

        const buffer = Buffer.from(photo, "base64");

        const uploadStream = bucket.openUploadStream(`${petName}-photo.${extension}`, {
            contentType: mimeType,
        });
        uploadStream.end(buffer);

        await new Promise((resolve, reject) => {
            uploadStream.on("finish", (file) => {
            photoId = uploadStream.id;
            resolve();
            });
            uploadStream.on("error", reject);
        });
    }

    const pet = await PetController.quickCreate({
        ...req.body,
      photo: photoId
    });

    res.status(201).json(pet);
  } catch (err) {
    console.error(err.message);
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