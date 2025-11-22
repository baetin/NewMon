import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export const getWeather = async (lat: number, lon: number) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: "metric",
          lang: "kr",
        },
      }
    );

    const data = response.data;
    return {
      name: data.name,
      temp: data.main.temp,
      desc: data.weather[0].description,
      icon: data.weather[0].icon,
    };
  } catch (err) {
    console.error("❌ 날씨 API 호출 실패:", err);
    throw err;
  }
};
