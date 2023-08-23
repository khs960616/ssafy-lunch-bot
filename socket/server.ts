import express from "express";
import dotenv from "dotenv"
import { login, getDailyLunchMenu } from "./wellstory"
import { sendLunchMenu } from "./mattermost"
import { DailyMenu } from "./wellstory/type";
const cron = require("node-cron");

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.listen(process.env.PORT, ()=>{
    cron.schedule('* * * * * *', async ()=>{
        const sessionValue = await login();
        const currentDate = new Date().toISOString().split('T')[0].replace(/-/gi, "");
        const menus: DailyMenu[] = await getDailyLunchMenu(currentDate, sessionValue);
        sendLunchMenu(menus);
    });
});