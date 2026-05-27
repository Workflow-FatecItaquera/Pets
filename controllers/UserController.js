import User from "../models/User.js";
import Database from "../models/Database.js";
import bcrypt from "bcryptjs";

class UserController {

    static async findAll(){
        await Database.getConnection();
        return User.find({ isActive: true });
    }

    static async findById(id){
        await Database.getConnection();
        return User.findById(id);
    }

    static async createUser(data){
        await Database.getConnection();
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = new User({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            picture: data.picture,
            isActive: true,
            isAdmin: false
        });
        return user.save();
    }

    static async login(data){
        try {
            await Database.getConnection();
            const user = await User.findOne({email: data.email});
            if(!user){
                throw new Error("User not found");
            }
            const isMatch = await bcrypt.compare(data.password, user.password);
            if(!isMatch){
                throw new Error("Invalid credentials");
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    static async update(data) {
        try {
            await Database.getConnection();

            const user = await User.findByIdAndUpdate(
                data._id,
                { $set: data },
                { new: true }
            );

            if (!user) {
                throw new Error("Usuário não encontrado");
            }

            return user;
        } catch (err) {
            throw err;
        }
    }

    static async activeToggle(id) {
        try {
            await Database.getConnection();
            const user = await User.findByIdAndUpdate(
                id,
                { $set: { isActive: !user.isActive } },
                { new: true }
            );
            if (!user) {
                throw new Error("Usuário não encontrado");
            }
            return user;
        } catch (err) {
            throw err;
        }
    }

    static async adminToggle(id) {
        try {
            await Database.getConnection();
            const user = await User.findByIdAndUpdate(
                id,
                { $set: { isAdmin: !user.isAdmin } },
                { new: true }
            );
            if (!user) {
                throw new Error("Usuário não encontrado");
            }
            return user;
        } catch (err) {
            throw err;
        }
    }

    static async clearAll(){
        try {
            User.deleteMany({});
            return "Limpeza concluída";
        } catch (error) {
            return "Houve um erro";
        }
    }
}

export default UserController;