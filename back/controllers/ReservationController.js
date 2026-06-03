const Reservation = require("../models/Reservation");
const Database = require("../models/Database");

class ReservationController {

    static async findAll(userId, isAdmin) {
        await Database.getConnection();

        const query = { active: true };
        if (!isAdmin) {
            query.user = userId;
        }

        return Reservation.find(query)
        .populate({
            path: "pet",
            populate: {
                path: "tutor"
            }
        });
    }

    static async insertOne(data) {
        await Database.getConnection();

        if (!data.user) {
            throw new Error("Usuário responsável não definido.");
        }

        const startNew = new Date(data.startDate);
        const endNew = new Date(startNew.getTime() + data.estimatedDuration * 60000);

        const conflict = await Reservation.findOne({
            user: data.user,
            active: true,
            startDate: { $lt: endNew },
            $expr: {
                $gt: [
                    { $add: ["$startDate", { $multiply: ["$estimatedDuration", 60000] }] },
                    startNew
                ]
            }
        });

        if (conflict) {
            throw new Error("Você já possui um agendamento neste mesmo horário.");
        }

        const reservation = new Reservation({
            ...data,
            active: true
        });

        return reservation.save();
    }

    static async update(data) {
        try {
            await Database.getConnection();

            const reservation = await Reservation.findByIdAndUpdate(
                data._id,
                { $set: data },
                { new: true }
            );

            if (!reservation) {
                throw new Error("Reserva não encontrada");
            }

            return reservation;

        } catch (err) {
            throw err;
        }
    }

    static async activeToggle(id) {
        try {
            await Database.getConnection();

            const currentReservation = await Reservation.findById(id);

            if (!currentReservation) {
                throw new Error("Reserva não encontrada");
            }

            const reservation = await Reservation.findByIdAndUpdate(
                id,
                {
                    $set: {
                        active: !currentReservation.active
                    }
                },
                { new: true }
            );

            return reservation;

        } catch (err) {
            throw err;
        }
    }
}

module.exports = ReservationController;