import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fffaf6, #ffe8e0);
`;

export const Card = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 50px 70px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  text-align: center;

  ${({ theme }) => theme.media.mobileDown} {
    padding: 32px 20px;
    border-radius: 16px;
  }
`;

export const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;

  ${({ theme }) => theme.media.mobileDown} {
    font-size: 1.2rem;
  }
`;

export const InterestList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
`;

export const InterestItem = styled.div<{ selected: boolean }>`
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid ${({ selected }) => (selected ? '#fa9675' : '#ccc')};
  background: ${({ selected }) => (selected ? '#ffe3d7' : 'white')};
  color: ${({ selected }) => (selected ? '#d25b39' : '#333')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary};
    background: ${({ selected }) => (selected ? '#ffd8c7' : '#fff5f0')};
  }
`;

export const SubmitButton = styled.button`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  border-radius: 20px;
  padding: 12px 30px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;

  &:hover {
    background-color: #f27c5a;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;
