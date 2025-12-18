import { useUserLocation } from '@/features/home/hooks/useUserLocation';
import { useWeatherQuery } from '@/features/home/hooks/useWeatherQuery';
import {
  NoticeText,
  WeatherContainer,
} from '@/features/home/ui/Weather/Weather.styles';
import { Spinner } from '@/shared/ui/Spinner/Spinner';

export const Weather = () => {
  const { coords, notice } = useUserLocation();

  const { data, isPending, error } = useWeatherQuery(
    coords?.lat ?? 37.5665,
    coords?.lon ?? 126.978
  );

  return (
    <WeatherContainer>
      <h3>Today's Weather</h3>

      {error && <div>날씨 정보를 불러오지 못했습니다.</div>}

      {isPending || !data ? (
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
