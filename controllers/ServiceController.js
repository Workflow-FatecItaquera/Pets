import Service from "../models/Service.js";
import Database from "../models/Database.js";

class ServiceController {

    static async findById(id) {
        await Database.getConnection();
        return Service.findById(id);
    }

    static async findAll() {
        await Database.getConnection();
        return Service.find({ isActive: true });
    }

    static async insertOne(data) {
        await Database.getConnection();
        const service = new Service(data);
        return service.save();
    }

    static async update(data) {
        try {
            await Database.getConnection();
            
            const serviceDataToUpdate = { ...data };

            const service = await Service.findByIdAndUpdate(
                data._id,
                { $set: serviceDataToUpdate },
                { new: true }
            );

            if (!service) {
                throw new Error("Serviço não encontrado");
            }

            return service;
        } catch (err) {
            throw err;
        }
    }

    static async activeToggle(id) {
        try {
            await Database.getConnection();
            
            const currentService = await Service.findById(id);
            if (!currentService) {
                throw new Error("Serviço não encontrado");
            }

            const service = await Service.findByIdAndUpdate(
                id,
                { $set: { isActive: !currentService.isActive } },
                { new: true }
            );
            
            return service;
        } catch (err) {
            throw err;
        }
    }
}

export default ServiceController;