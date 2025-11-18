import { useState } from "react";
import {
  Title,
  Container,
  InterestList,
  InterestItem,
  SubmitButton,
  Card,
} from "./InterestSelect.styles";
import { topics } from "../../../shared/model/topics";
import { handleUserInterests } from "../api/handleUserInterests";
import { useNavigate } from "react-router-dom";

const InterestSelectPage = () => {
  const [selected, setSelected] = useState<number[]>([]);

  const navigate = useNavigate();

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

  const handleSubmit = async () => {
    await handleUserInterests({ interests: selected, navigate });
  };

  return (
    <Container>
      <Card>
        <Title>관심 분야를 2개 선택하세요</Title>
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
        <SubmitButton disabled={selected.length !== 2} onClick={handleSubmit}>
          선택 완료
        </SubmitButton>
      </Card>
    </Container>
  );
};

export default InterestSelectPage;
