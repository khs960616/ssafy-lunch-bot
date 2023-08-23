import express from "express";
import dotenv from "dotenv"
const cron = require("node-cron");
import { login, getDailyLunchMenu } from "./wellstory"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.listen(process.env.PORT, ()=>{
    cron.schedule('* * * * * *', async ()=>{
        const sessionValue = await login();
        const currentDate = new Date().toISOString().split('T')[0].replace(/-/gi, "");
        const response = getDailyLunchMenu(currentDate, sessionValue);
    });
});