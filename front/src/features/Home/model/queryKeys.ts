export const homeQuerykeys = {
  hotTopics: ['home', 'hot-topics'] as const,
  interests: ['home', 'interest-topics'] as const,
  weather: (lat: number, lon: number) => ['weather', lat, lon] as const,
};
