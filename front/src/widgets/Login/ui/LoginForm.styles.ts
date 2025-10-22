import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  width: 100%;
  background: linear-gradient(135deg, #162733, #fa9675);
`;

export const Card = styled.div`
  background-color: #ffffff;
  padding: 120px 80px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Logo = styled.img`
  height: 150px;
  width: 180px;
  margin-bottom: 50px;
`;

export const GoogleButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 10px;
  button {
    width: 100% !important;
    max-width: 250px;
  }
`;
export const NaverButtonWrapper = styled.div`
  width: 100%;
  a {
    display: block;
    width: 100%;
    text-align: center;
    padding: 10px 0;
    background-color: #1ec800;
    color: white;
    font-weight: bold;
    border-radius: 5px;
    cursor: pointer;
    text-decoration: none;
  }
  :hover {
    background-color: #16a600;
  }
`;
