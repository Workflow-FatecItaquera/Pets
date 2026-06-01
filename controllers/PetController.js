import Pet from "../models/Pet.js";
import Tutor from "../models/Tutor.js";
import Database from "../models/Database.js";

class PetController {

    static async findById(id) {
        await Database.getConnection();
        return Pet.findById(id).populate("tutor");
    }

    static async findAll() {
        await Database.getConnection();
        return Pet.find({ isActive: true }).populate("tutor");
    }

    static async search(query) {
        await Database.getConnection();
        if (!query) {
            return this.findAll();
        }

        const matchingTutors = await Tutor.find({
            name: { $regex: query, $options: "i" }
        });
        const tutorIds = matchingTutors.map(t => t._id);

        return Pet.find({
            isActive: true,
            $or: [
                { name: { $regex: query, $options: "i" } },
                { tutor: { $in: tutorIds } }
            ]
        }).populate("tutor");
    }

    static async quickCreate(data) {
        await Database.getConnection();

        const tutor = new Tutor({
            name: data.tutorName,
            phone: data.phone,
            address: data.address || ""
        });
        const savedTutor = await tutor.save();

        const pet = new Pet({
            name: data.petName,
            tutor: savedTutor._id,
            type: data.type || "Cachorro",
            breed: data.breed,
            size: data.size,
            age: data.age,
            behavior: data.behavior,
            aestheticPreferences: data.aestheticPreferences,
            notes: data.notes,
            photo: data.photo || null,
            isActive: true
        });
        const savedPet = await pet.save();

        return Pet.findById(savedPet._id).populate("tutor");
    }

    static async insertOne(data) {
        await Database.getConnection();
        const pet = new Pet(data);
        const savedPet = await pet.save();
        return Pet.findById(savedPet._id).populate("tutor");
    }

    static async update(data) {
        try {
            await Database.getConnection();
            const petDataToUpdate = { ...data };
            delete petDataToUpdate.tutor; 
            if (data.photo === undefined) {
                delete petDataToUpdate.photo; // não mexe na foto
            }
            const pet = await Pet.findByIdAndUpdate(
                data._id,
                { $set: petDataToUpdate },
                { new: true }
            );
            if (!pet) {
                throw new Error("Pet não encontrado");
            }
            const novoNomeTutor = data.tutorName || (data.tutor && data.tutor.name);
            const novoTelefoneTutor = data.phone || (data.tutor && data.tutor.phone);
            if ((novoNomeTutor || novoTelefoneTutor) && pet.tutor) {
                const tutorId = pet.tutor._id || pet.tutor;
                const tutorUpdateData = {};
                if (novoNomeTutor) tutorUpdateData.name = novoNomeTutor;
                if (novoTelefoneTutor) tutorUpdateData.phone = novoTelefoneTutor;
                await Tutor.findByIdAndUpdate(
                    tutorId, 
                    { $set: tutorUpdateData },
                    { new: true }
                );
            }
            const petAtualizado = await Pet.findById(pet._id).populate("tutor");

            return petAtualizado;
        } catch (err) {
            throw err;
        }
    }

    static async activeToggle(id) {
        try {
            await Database.getConnection();
            const currentPet = await Pet.findById(id);
            if (!currentPet) {
                throw new Error("Pet não encontrado");
            }
            const pet = await Pet.findByIdAndUpdate(
                id,
                { $set: { isActive: !currentPet.isActive } },
                { new: true }
            ).populate("tutor");
            return pet;
        } catch (err) {
            throw err;
        }
    }

    static async clearAll() {
        try {
            await Pet.deleteMany({});
            return "Limpeza concluída";
        } catch (error) {
            console.error(error);
            throw new Error("Houve um erro na limpeza");
        }
    }
}

export default PetController;