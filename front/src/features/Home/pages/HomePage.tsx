import { useState } from "react";

import {
  TopicContainer,
  Left,
  Right,
} from "@/shared/styles/articleContents.styles";

import { useSessionCheckQuery } from "@/features/auth";

import {
  MainHotTopicArticle,
  MainInterestsArticle,
  MainRightSection,
} from "@/features/home";

import { TabWrapper, Tab } from "./HomePage.styles";

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
