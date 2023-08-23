import dotenv from "dotenv"
import { DailyMenu } from "../wellstory/type";
import { lunchFormatter } from "./lunchFormatter";
const Mattermost = require('node-mattermost');

dotenv.config();

const mattermost = new Mattermost(process.env.MATTER_MOST_HOOK || "");
const CHANNEL = process.env.CHANNEL_NAME;
export const sendLunchMenu = async(dailyMenus: DailyMenu[])=>{

    const currentDate = new Date().toISOString().split('T')[0];
    const formmatingMenus = lunchFormatter(dailyMenus);
    mattermost.send({
        text: `> ###${currentDate} 서울 캠퍼스 점심 메뉴`,
        channel: CHANNEL,
        attachments: formmatingMenus,
    });
}
