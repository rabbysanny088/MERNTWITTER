const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDb connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectToMongoDB;
