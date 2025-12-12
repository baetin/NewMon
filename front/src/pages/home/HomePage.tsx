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
import { Tab, TabWrapper } from "./HomePage.styles";

import { useSearchParams } from "react-router-dom";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const isShow = tab === "interest";

  const { data: sessionData } = useSessionCheckQuery();

  return (
    <TopicContainer>
      <Left>
        <TabWrapper>
          <Tab
            $active={!isShow}
            onClick={() => setSearchParams({ tab: "hot" })}
          >
            Hot Topic
          </Tab>

          {sessionData?.isAuthenticated && (
            <Tab
              $active={isShow}
              onClick={() => setSearchParams({ tab: "interest" })}
            >
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
