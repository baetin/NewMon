import { motion } from "framer-motion";
import styled from "styled-components";

export const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

export const ExpandedCard = styled(motion.div)`
  position: relative;
  background: #fff;
  border-radius: 20px;
  width: 800px;
  max-width: 90%;
  max-height: 80vh;
  padding: 2.5rem 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow-y: scroll;
  /* 크롬, 사파리 */
  &::-webkit-scrollbar {
    display: none;
  }

  /* 파이어폭스 */
  scrollbar-width: none;

  /* IE 10+ */
  -ms-overflow-style: none;

  h2 {
    margin: 0 0 1rem 0;
  }
  span {
    font-size: 0.9rem;
  }
  p:first-of-type {
    color: #555;
    line-height: 1.3;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
`;

export const MainArticle = styled.p`
  line-height: 1.5;
  font-weight: 600;
  font-size: 1.3rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

export const CloseBtn = styled.div`
  position: absolute;
  top: 10px;
  right: 30px;
  cursor: pointer;
`;

export const SubInforContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
  .written {
    background-color: #ffc8c8;
  }
  .modified {
    background-color: yellow;
  }
`;
