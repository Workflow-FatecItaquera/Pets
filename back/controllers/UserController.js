const User = require("../models/User");
const Database = require("../models/Database");

class UserController {

    static async findAll(){
        await Database.getConnection();
        return User.find({});
    }

    static async insertOne(data){
        await Database.getConnection();
        const user = new User(data);
        return user.save();
    }

}

module.exports = UserController;