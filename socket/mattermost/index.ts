import dotenv from "dotenv"
const Mattermost = require('node-mattermost');

dotenv.config();

const mattermost = new Mattermost(process.env.MATTER_MOST_HOOK || "");

export const sendLunchMenu = async(callBack: ()=>any)=>{
    const response = await callBack();

    mattermost.send({
        text: "test",
        channel: "lunch-bot",
        username: '테스트',
    });
}
