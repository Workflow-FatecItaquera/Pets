const Tutor = require("../models/Tutor");
const Database = require("../models/Database");

class TutorController {

    static async findAll() {
        await Database.getConnection();

        return Tutor.find({
            isActive: true
        });
    }

    static async insertOne(data) {
        await Database.getConnection();

        const tutor = new Tutor({
            ...data,
            isActive: true
        });

        return tutor.save();
    }

    static async update(data) {
        try {
            await Database.getConnection();

            const tutor = await Tutor.findByIdAndUpdate(
                data._id,
                { $set: data },
                { new: true }
            );

            if (!tutor) {
                throw new Error("Tutor não encontrado");
            }

            return tutor;

        } catch (err) {
            throw err;
        }
    }

    static async activeToggle(id) {
        try {
            await Database.getConnection();

            const currentTutor = await Tutor.findById(id);

            if (!currentTutor) {
                throw new Error("Tutor não encontrado");
            }

            const tutor = await Tutor.findByIdAndUpdate(
                id,
                {
                    $set: {
                        isActive: !currentTutor.isActive
                    }
                },
                { new: true }
            );

            return tutor;

        } catch (err) {
            throw err;
        }
    }
}

module.exports = TutorController;