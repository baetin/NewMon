import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const Left = styled.div`
  flex: 3;
  min-width: 0; // 킥 강제로 부모의 폭을 넘지 않도록 설정
`;

export const TopicsLeft = styled.div`
  flex: 1.3;
  min-width: 0;
`;

export const Right = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
