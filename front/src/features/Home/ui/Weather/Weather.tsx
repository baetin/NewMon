import { useState, useEffect } from "react";

import {
  NoticeText,
  WeatherContainer,
} from "@/features/home/ui/Weather/Weather.styles";

import { Spinner } from "@/shared/ui/Spinner/Spinner";
import { useWeatherQuery } from "@/features/home/hooks/useWeatherQuery";

export const Weather = () => {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        setCoords({ lat: 37.5665, lon: 126.978 }); // 서울
        setNotice(
          "위치 접근을 허용해야 사용자 지역의 날씨를 볼 수 있습니다.\nNewMon 에서는 서울의 온도를 제공합니다."
        );
      }
    );
  }, []);

  const { data, isLoading, error } = useWeatherQuery(
    coords?.lat ?? 37.5665,
    coords?.lon ?? 126.978
  );

  return (
    <WeatherContainer>
      <h3>Today's Weather</h3>

      {error && <div>날씨 정보를 불러오지 못했습니다.</div>}

      {isLoading || !data ? (
        <>
          <span>현재 위치의 날씨를 불러오는 중...</span>
          <Spinner />
        </>
      ) : (
        <>
          {notice && <NoticeText>{notice}</NoticeText>}

          <span>📍 {data.name}</span>
          <img
            src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
            alt="날씨 아이콘"
          />
          <span>{data.desc}</span>
          <span>{data.temp.toFixed(1)}℃</span>
        </>
      )}
    </WeatherContainer>
  );
};
