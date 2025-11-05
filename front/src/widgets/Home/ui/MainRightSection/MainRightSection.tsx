import { HotTopicList } from "../../../../features/Home/ui/HotTopic/HotTopic";
import { TrendChart } from "../../../../features/Home/ui/TrendChart/TrendChart";
import { Weather } from "../../../../features/Home/ui/Weather/Weather";

export const MainRightSection = () => {
  return (
    <>
      <HotTopicList />
      <TrendChart />
      <Weather />
    </>
  );
};
