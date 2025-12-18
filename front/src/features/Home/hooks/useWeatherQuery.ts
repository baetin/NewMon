import { useQuery } from '@tanstack/react-query';

import { getWeather } from '@/features/home/api/getWeather';
import type { WeatherDataProps } from '@/features/home/model/WeatherDataProps.types';

import { homeQuerykeys } from '../model/queryKeys';

export const useWeatherQuery = (lat: number, lon: number) => {
  return useQuery<WeatherDataProps, Error>({
    queryKey: homeQuerykeys.weather(lat, lon),
    queryFn: () => getWeather(lat, lon),
    staleTime: 1000 * 60 * 10,
    retry: 1,
    enabled: Number.isFinite(lat) && Number.isFinite(lon),
  });
};
