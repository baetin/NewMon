import { TopicList } from '@/features/home/ui/TopicList/TopicList';
import { TrendChart } from '@/features/home/ui/TrendChart/TrendChart';
import { Weather } from '@/features/home/ui/Weather/Weather';

export const MainRightSection = () => {
  return (
    <>
      <TopicList />
      <TrendChart />
      <Weather />
    </>
  );
};
