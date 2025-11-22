import { useQuery } from "@tanstack/react-query";
import { getWeather } from "../api/getWeather";
import type { WeatherDataProps } from "../model/WeatherDataProps.types";

export const useWeatherQuery = (lat: number, lon: number) => {
  return useQuery<WeatherDataProps, Error>({
    queryKey: ["weather", lat, lon],
    queryFn: () => getWeather(lat, lon),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
};
