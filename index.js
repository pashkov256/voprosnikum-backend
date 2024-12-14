import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import TestRoute from "./routes/Test.js";
import TestResultRoute from "./routes/TestResult.js";
import QuestionRoute from "./routes/Question.js";
import GroupRoute from "./routes/Group.js";
import UserRoute from "./routes/User.js";

const app = express();
dotenv.config();
mongoose
    .connect(process.env.mongoConnectUrl)
    .then(() => {
        console.log("MONGODB WORKING");
    })
    .catch((err) => {
        console.log(err);
    });

app.use(cors());
app.use(express.json());
app.use(UserRoute);
app.use(TestRoute);
app.use(TestResultRoute);
app.use(QuestionRoute);
app.use(GroupRoute);
app.listen(3333, () => {
    console.log("server working on 3333 PORT");
});

