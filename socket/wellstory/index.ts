import dotenv from "dotenv";
import axios from "axios";
import { DailyMenu } from "./type";

dotenv.config();

const baseURL = process.env.WELLSTORY_BASE_URL;
const axiosInstance = axios.create({
    baseURL: baseURL
});

export const login = async() => {
    let response: any;
    try {
        response = await axiosInstance.post(`/login?username=${process.env.WELLSTORY_ID}&password=${process.env.WELLSTORY_PASSWORD}&remember-me=true`);
    } catch(e) {
    }
    return response.headers["set-cookie"][0].split(";")[0]+";";
}

export const getDailyLunchMenu = async(date: string, cookie: string):Promise<DailyMenu[]> => {
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