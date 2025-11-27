import { HotTopicList } from "../../../../features/Home/ui/HotTopic/HotTopic";
import { InterestTopic } from "../../../../features/Home/ui/InterestTopic/InterestTopic";
import { TrendChart } from "../../../../features/Home/ui/TrendChart/TrendChart";
import { Weather } from "../../../../features/Home/ui/Weather/Weather";

interface MainRightSectionProps {
  isShow: boolean;
}

export const MainRightSection = ({ isShow }: MainRightSectionProps) => {
  return (
    <>
      {!isShow && <HotTopicList />}
      {isShow && <InterestTopic />}

      <TrendChart />
      <Weather />
    </>
  );
};
