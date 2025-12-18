import { useEffect, useRef } from 'react';

import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useSessionCheckQuery } from '@/features/auth';
import {
  MainHotTopicArticle,
  MainInterestsArticle,
  MainRightSection,
} from '@/features/home';
import {
  Left,
  Right,
  TopicContainer,
} from '@/shared/styles/articleContents.styles';

import { Tab, TabWrapper } from './HomePage.styles';

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const { data: sessionData } = useSessionCheckQuery();
  const isAuthenticated = sessionData?.isAuthenticated;

  const resolvedTab =
    tab === 'interest' && !isAuthenticated ? 'hot' : (tab ?? 'hot');

  const isInterestTab = resolvedTab === 'interest';

  const warnedRef = useRef(false);
  useEffect(() => {
    if (tab === 'interest' && !isAuthenticated && !warnedRef.current) {
      toast('로그인 후 이용할 수 있는 기능입니다.');
      warnedRef.current = true;
    }
  }, [tab, isAuthenticated]);

  return (
    <TopicContainer>
      <Left>
        <TabWrapper>
          <Tab
            $active={!isInterestTab}
            onClick={() => setSearchParams({ tab: 'hot' })}
          >
            Hot Topic
          </Tab>

          {sessionData?.isAuthenticated && (
            <Tab
              $active={isInterestTab}
              onClick={() => setSearchParams({ tab: 'interest' })}
            >
              Your Interests
            </Tab>
          )}
        </TabWrapper>

        {!isInterestTab && <MainHotTopicArticle />}
        {isInterestTab && sessionData?.isAuthenticated && (
          <MainInterestsArticle />
        )}
      </Left>

      <Right>
        <MainRightSection isShow={isInterestTab} />
      </Right>
    </TopicContainer>
  );
};

export default HomePage;
