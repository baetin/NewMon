import { HotTopicList } from "@/features/home/ui/HotTopic/HotTopic";
import { InterestTopic } from "@/features/home/ui/InterestTopic/InterestTopic";
import { TrendChart } from "@/features/home/ui/TrendChart/TrendChart";
import { Weather } from "@/features/home/ui/Weather/Weather";

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
