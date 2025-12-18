import { useEffect, useState } from 'react';

export const useUserLocation = () => {
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
          '위치 접근을 허용해야 사용자 지역의 날씨를 볼 수 있습니다.\nNewMon 에서는 서울의 온도를 제공합니다.'
        );
      }
    );
  }, []);
  return { coords, notice };
};
