const dotenv = require("dotenv");
const axios = require("axios");
const Mattermost = require('node-mattermost');

dotenv.config();

const baseURL = process.env.WELLSTORY_BASE_URL;
const axiosInstance = axios.create({
    baseURL: baseURL
});

const mattermost = new Mattermost(process.env.MATTER_MOST_HOOK || "");
const CHANNEL = process.env.CHANNEL_NAME;

const lunchFormatter = (menus: any) => {
    const messages = menus.map((menu: { courseTxt: any; menuName: any; sumKcal: any; subMenuTxt: any; photoUrl: any; photoCd: any; }) => {
        return {
            color: "#ADFF2F",
            title: `${menu.courseTxt} - ${menu.menuName} (${menu.sumKcal}kcal)`,
            text: `${menu.subMenuTxt}`,
            image_url: `${menu.photoUrl}${menu.photoCd}`
        };
    });
    return messages;
};

const sendLunchMenu = async (dailyMenus: any) => {
    const date = new Date();
    date.setHours(date.getHours() + 9);
    
    const currentDate = date.toISOString().split('T')[0];
    const formmatingMenus = lunchFormatter(dailyMenus);
    console.log("Menu Info: ",formmatingMenus);
    const response = await mattermost.send({
        text: `> ### ${currentDate} 서울 캠퍼스 점심 메뉴\n [내일 20층 서울 캠퍼스 메뉴 미리보기](https://ssafsound.com/lunch?campus=%EC%84%9C%EC%9A%B8&date=tomorrow)`,
        channel: CHANNEL,
        attachments: formmatingMenus,
    });

    console.log("MM Response Result: ",response);
};

const login = async() => {
    let response: any;
    try {
        response = await axiosInstance.post(`/login?username=${process.env.WELLSTORY_ID}&password=${process.env.WELLSTORY_PASSWORD}&remember-me=true`);
    } catch(e) {
        console.log(e);
    }
    return response.headers["set-cookie"][0].split(";")[0]+";";
}

const getDailyLunchMenu = async(date: string, cookie: string):Promise<any[]> => {
    let response: any;

    try {
    response = await axiosInstance.get(`/api/meal?menuDt=${date}&menuMealType=2&restaurantCode=REST000133`, {
        headers: {
            Cookie: cookie
        }
    });
    } catch(e) {
        console.log(e);
    }
    return response.data.data.mealList;
};

const sendLunchMenuForMM = async () => {
    const sessionValue = await login();
    const date = new Date();
    date.setHours(date.getHours() + 9);

    const kstDate = date.toISOString().split('T')[0].replace(/-/gi, "");
    const menus = await getDailyLunchMenu(kstDate, sessionValue);
    if(menus.length) {
        await sendLunchMenu(menus);
    }
}

exports.handler = async function (event: any) {
    await sendLunchMenuForMM();
    return 200;
  };
