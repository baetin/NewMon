import { useEffect, useState } from "react";
import { NoticeText, WeatherContainer } from "./Weather.styles";
import { fetchWeather } from "../../api/Weather/getWeather";
import { Spinner } from "../../../../shared/ui";

export const Weather: React.FC = () => {
  const [weather, setWeather] = useState<{
    temp: number;
    desc: string;
    icon: string;
    name: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const savedWeather = sessionStorage.getItem("weather");
    if (savedWeather) {
      setWeather(JSON.parse(savedWeather));
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const data = await fetchWeather(latitude, longitude);
            setWeather(data);
            sessionStorage.setItem("weather", JSON.stringify(data));
          } catch (err) {
            console.error("날씨 불러오기 실패:", err);
            setError("날씨 정보를 불러오지 못했습니다.");
          }
        },
        async (err) => {
          console.error("위치 접근 거부됨:", err);
          const seoul = { lat: 37.5665, lon: 126.978 };
          try {
            const data = await fetchWeather(seoul.lat, seoul.lon);
            setWeather(data);
            setNotice(
              "위치 접근을 허용해야 사용자 지역의 날씨를 볼 수 있습니다.\nNewMon 에서는 서울의 온도를 제공합니다."
            );
          } catch (error) {
            setError("서울 날씨를 불러오지 못했습니다.");
          }
        }
      );
    } else {
      setError("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
    }
  }, []);

  return (
    <WeatherContainer>
      <h3>Today's Weather</h3>

      {error ? (
        <div>{error}</div>
      ) : weather ? (
        <>
          {notice && <NoticeText>{notice}</NoticeText>}

          <span>📍 {weather.name}</span>
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt="weather icon"
          />

          <span>{weather.desc}</span>
          <span>{weather.temp.toFixed(1)}℃</span>
        </>
      ) : (
        <>
          <span>현재 위치의 날씨를 불러오는 중...</span>
          <Spinner />
        </>
      )}
    </WeatherContainer>
  );
};
