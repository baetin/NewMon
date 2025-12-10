import { useState } from "react";

import {
  TopicContainer,
  Left,
  Right,
} from "@/shared/styles/articleContents.styles";

import { MainHotTopicArticle } from "@/features/home/ui/MainHotTopicArticle/MainHotTopicArticle";
import { MainInterestsArticle } from "@/features/home/ui/MainInterestsArticle/MainInterestsArticle";
import { MainRightSection } from "@/features/home/ui/MainRightSection/MainRightSection";

import { useSessionCheckQuery } from "@/features/auth/hooks/useSessionCheckQuery";

import { TabWrapper, Tab } from "@/features/home/pages/HomePage.styles";

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
