import React from "react";
import { HotTopicContainer } from "./HotTopic.styles";
import { examples } from "../../../../widgets/Home/model/examples"; // dummy data

export const HotTopicList: React.FC = () => {
  return (
    <HotTopicContainer>
      <h3>🔥 Hot Topic</h3>
      <ul>
        {examples.map((topic, i) => (
          <li key={i}>{topic.title}</li>
        ))}
      </ul>
      <p>갱신시간 기준</p>
    </HotTopicContainer>
  );
};
