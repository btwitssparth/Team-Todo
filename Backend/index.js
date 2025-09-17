import mongoose from "mongoose";
import dotenv from "dotenv";
import ConnectDB from "./Db/db.js";
import { app } from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

ConnectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("❌ Failed to connect to the database", error);
  });
