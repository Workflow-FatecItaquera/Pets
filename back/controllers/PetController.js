const Pet = require("../models/Pet");
const Database = require("../models/Database");

class PetController {

    static async findAll(){
        await Database.getConnection();
        return Pet.find({ active: true }).populate("tutor");
    }

    static async insertOne(data){
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
                { $set: { active: !currentPet.active } },
                { new: true }
            );
            return pet;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = PetController;
