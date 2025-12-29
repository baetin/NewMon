import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useUserInterestsMutation } from '@/features/interestSelect/hooks/useUserInterestsMutation';
import { topics } from '@/shared/model/topics';

import {
  Card,
  Container,
  InterestItem,
  InterestList,
  SubmitButton,
  Title,
} from './InterestSelectForm.styles';

export const InterestSelectForm = () => {
  const [selected, setSelected] = useState<number[]>([]);

  const navigate = useNavigate();
  const { mutate, isPending } = useUserInterestsMutation();

  const toggleInterest = (interest: number) => {
    setSelected((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, interest];
    });
  };

  const handleSubmit = () =>
    mutate(
      { interests: selected },
      {
        onSuccess: () => {
          alert('관심 종목 설정에 성공했습니다.');
          navigate('/');
        },
        onError: () => {
          alert('시스템 오류로 관심 종목 설정에 실패했습니다.');
        },
      }
    );

  return (
    <Container>
      <Card>
        <Title>관심 분야를 2개 선택하세요.</Title>
        <InterestList>
          {topics.map((topic) => (
            <InterestItem
              key={topic.label}
              selected={selected.includes(topic.topicId)}
              onClick={() => toggleInterest(topic.topicId)}
            >
              {topic.label}
            </InterestItem>
          ))}
        </InterestList>
        <SubmitButton
          disabled={selected.length !== 2 || isPending}
          onClick={handleSubmit}
        >
          {isPending ? '저장 중...' : '선택 완료'}
        </SubmitButton>
      </Card>
    </Container>
  );
};
