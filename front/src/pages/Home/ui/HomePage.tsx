import { useState } from "react";
import {
  TopicContainer,
  Left,
  Right,
} from "../../../shared/styles/articleContents.styles";
import { MainHotTopicArticle } from "../../../widgets/Home/ui/MainHotTopicArticle/MainHotTopicArticle";
import { MainInterestsArticle } from "../../../widgets/Home/ui/MainInterestsArticle/MainInterestsArticle";
import { MainRightSection } from "../../../widgets/Home/ui/MainRightSection/MainRightSection";
import { Tab, TabWrapper } from "./HomePage.styles";
import { useSessionCheckQuery } from "../../../shared/hoooks/useSessionCheckQuery";

const HomePage = () => {
  const [isShow, setIsShow] = useState(false);
  const { data: sessionData } = useSessionCheckQuery();

  return (
    <TopicContainer>
      <Left>
        <TabWrapper>
          <Tab $active={!isShow} onClick={() => setIsShow(false)}>
            Hot Topic
          </Tab>
          {sessionData?.isAuthenticated && (
            <Tab $active={isShow} onClick={() => setIsShow(true)}>
              Your Interests
            </Tab>
          )}
        </TabWrapper>
        {!isShow && <MainHotTopicArticle />}
        {isShow && sessionData?.isAuthenticated && <MainInterestsArticle />}
      </Left>
      <Right>
        <MainRightSection isShow={isShow} />
      </Right>
    </TopicContainer>
  );
};

export default HomePage;
