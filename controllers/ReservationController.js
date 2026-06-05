import Reservation from "../models/Reservation.js";
import Database from "../models/Database.js";

class ReservationController {

    static async findAll(userId, isAdmin) {
        await Database.getConnection();

        const query = { active: true };
        if (!isAdmin) {
            query.user = userId;
        }

        return Reservation.find(query)
        .populate("user")
        .populate({
            path: "pet",
            populate: {
                path: "tutor"
            }
        });
    }

    static async insertOne(data) {
        await Database.getConnection();

        const start = new Date(data.startDate);

        const end = new Date(start);
        end.setMinutes(
            end.getMinutes() +
            (data.estimatedDuration || 0)
        );

        const overlap = await Reservation.findOne({
            active: true,

            user: data.user,

            status: {
                $nin: [
                    "CONCLUIDO"
                ]
            },

            $expr: {
                $and: [
                    {
                        $lt: [
                            "$startDate",
                            end
                        ]
                    },

                    {
                        $gt: [
                            {
                                $dateAdd: {
                                    startDate:
                                        "$startDate",

                                    unit:
                                        "minute",

                                    amount:
                                        "$estimatedDuration"
                                }
                            },

                            start
                        ]
                    }
                ]
            }
        });

        if (overlap) {
            throw new Error(
                "Este usuário já possui um agendamento nesse horário."
            );
        }

        const reservation =
            new Reservation({
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

export default ReservationController;