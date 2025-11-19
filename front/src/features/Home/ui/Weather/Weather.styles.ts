import styled from "styled-components";
import { MainRightSectionStyles } from "../../../../shared/styles/mainRightSection.styles";

export const WeatherContainer = styled(MainRightSectionStyles)`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const NoticeText = styled.span`
  white-space: pre-line;
  word-break: keep-all;
  margin: 8px 0;
  color: ${({ theme }) => theme.colors.text.main};
  font-size: 14px;
  text-align: center;
`;
