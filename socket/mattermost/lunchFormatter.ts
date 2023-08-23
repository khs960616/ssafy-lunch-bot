import { DailyMenu } from "../wellstory/type";

export const lunchFormatter = (menus: DailyMenu[]) => {
    const messages = menus.map(menu=>{
        return {
            color: "#ADFF2F",
            title: `${menu.courseTxt} - ${menu.menuName} (${menu.sumKcal}kcal)`,
            text: `${menu.subMenuTxt}`,
            image_url: `${menu.photoUrl}${menu.photoCd}`
        };
    });
    return messages;
}