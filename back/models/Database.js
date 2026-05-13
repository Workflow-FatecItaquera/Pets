const mongoose = require("mongoose");

class Database {

    static instance = null;

    static async getConnection(){
        if(!Database.instance){
            try{
                await mongoose.connect(process.env.MONGODB_URI,{
                    serverSelectionTimeoutMS: 5000
                });
                Database.instance = mongoose.connection;
                console.log("Successfuly connected to Atlas");
            } catch(error){
                throw error;
            }
        }
        
        return Database.instance;
    }

}

module.exports = Database;