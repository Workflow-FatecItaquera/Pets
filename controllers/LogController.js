import Log from "../models/Log.js";
import User from "../models/User.js";
import Database from "../models/Database.js";

class LogController {

    static async findAll(){
        await Database.getConnection();
        return await Log.find().populate("user", "name email picture");
    }

    static async findByUser(userId){
        await Database.getConnection();
        return await Log.find({ user: userId }).populate("user", "name email picture");
    }

    static async create(userId, action, message){
        await Database.getConnection();
        const user = await User.findById(userId);
        if(!user){
            throw new Error("User not found");
        }
        const log = new Log({ user: userId, action, message });
        return await log.save();
    }
}

export default LogController;