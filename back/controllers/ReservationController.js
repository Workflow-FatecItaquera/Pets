const Reservation = require("../models/Reservation");
const Database = require("../models/Database");

class ReservationController {

    static async findAll(){
        await Database.getConnection();
        return Reservation.find({ active: true });
    }

    static async insertOne(data){
        await Database.getConnection();
        const reservation = new Reservation(data);
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
                { $set: { active: !currentReservation.active } },
                { new: true }
            );

            return reservation;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = ReservationController;
