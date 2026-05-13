const User = require("../models/User");
const Database = require("../models/Database");
const bcrypt = require("bcryptjs");

class UserController {

    static async findAll(){
        await Database.getConnection();
        return User.find({});
    }

    static async createUser(data){
        await Database.getConnection();
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = new User({
            name: data.name,
            email: data.email,
            password: hashedPassword
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

    static async activeToggle(data) {
        try {
            await Database.getConnection();
            const user = await User.findByIdAndUpdate(
                data._id,
                { $set: { isActive: !data.isActive } },
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

    static async adminToggle(data) {
        try {
            await Database.getConnection();
            const user = await User.findByIdAndUpdate(
                data._id,
                { $set: { isAdmin: !data.isAdmin } },
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
}

module.exports = UserController;