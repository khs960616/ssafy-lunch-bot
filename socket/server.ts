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
    console.log("#######");
    const date = new Date();
    date.setHours(date.getHours()+9);
    console.log(date);

    cron.schedule('0 0 7 * * MON-FRI', async ()=>{
        const sessionValue = await login();
        const date = new Date();
        date.setHours(date.getHours()+9);
        console.log(date);

        const kstDate = date.toISOString().split('T')[0].replace(/-/gi, "");
        const menus: DailyMenu[] = await getDailyLunchMenu(kstDate, sessionValue);
        sendLunchMenu(menus);
    });
});