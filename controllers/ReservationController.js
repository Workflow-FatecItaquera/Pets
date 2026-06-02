import Reservation from "../models/Reservation.js";
import Database from "../models/Database.js";

class ReservationController {

    static async findAll() {
        await Database.getConnection();

        return Reservation.find({
            active: true
        })
        .populate({
            path: "pet",
            populate: {
                path: "tutor"
            }
        });
    }

    static async insertOne(data) {
        await Database.getConnection();

        const reservation = new Reservation({
            ...data,
            active: true
        });

        return reservation.save();
    }

    static async update(data) {
        let reservation = data;
        delete reservation.userId;
        try {
            await Database.getConnection();

            const reservation = await Reservation.findByIdAndUpdate(
                data._id,
                { $set: reservation },
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

    static async clearAll(){
        try {
            Reservation.deleteMany({});
            return "Limpeza concluída";
        } catch (error) {
            return "Houve um erro";
        }
    }
}

export default ReservationController;