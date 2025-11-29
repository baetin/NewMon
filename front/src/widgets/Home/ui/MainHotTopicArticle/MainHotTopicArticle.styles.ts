import styled, { css } from "styled-components";

export const SlideWrapper = styled.div`
  position: relative;
  width: 100%; // 화면 너비 기준
  max-width: 1200px; // 필요에 따라 슬라이드 최대 너비
  margin: 0 auto; // 가운데 정렬
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover button {
    opacity: 1;
    visibility: visible;
  }
`;

export const ArticleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

export const Image = styled.img`
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  object-fit: cover;
  aspect-ratio: 2 / 1; // 가로:세로 비율 = 2:1
`;

export const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
`;

export const Summary = styled.p`
  font-size: 1rem;
  color: #555;
`;

export const CompareBox = styled.div`
  background: #f9f9f9;
  width: 100%;
  max-width: 800px;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 10px;
  padding: 12px;
  font-size: 0.9rem;
`;

export const ArrowButton = styled.button<{ direction: "left" | "right" }>`
  position: absolute;
  top: 70%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  opacity: 0;
  visibility: hidden;

  ${({ direction }) =>
    direction === "left"
      ? css`
          left: -50px;
        `
      : css`
          right: -50px;
        `}
  &:hover {
    background: rgba(230, 230, 230, 0.9);
    display: flex;
  }
`;

export const DotContainer = styled.div`
  position: absolute;
  bottom: 10px;
  display: flex;
`;

export const Dot = styled.div<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 5px;
  background: ${({ $active }) => ($active ? "#333" : "#ccc")};
`;
