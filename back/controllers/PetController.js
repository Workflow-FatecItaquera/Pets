const Pet = require("../models/Pet");
const Tutor = require("../models/Tutor");
const Database = require("../models/Database");

class PetController {

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
            isActive: true
        });
        const savedPet = await pet.save();

        return Pet.findById(savedPet._id).populate("tutor");
    }

    static async insertOne(data) {
        await Database.getConnection();
        const pet = new Pet(data);
        return pet.save();
    }

    static async update(data) {
        try {
            await Database.getConnection();
            const pet = await Pet.findByIdAndUpdate(
                data._id,
                { $set: data },
                { new: true }
            );
            if (!pet) {
                throw new Error("Pet não encontrado");
            }
            return pet;
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
            );
            return pet;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = PetController;