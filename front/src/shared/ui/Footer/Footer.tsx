import React from "react";
import { FooterContainer, FooterLink } from "./Footeer.styles";

export const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <p>© 2025 NewMon — AI로 배우는 뉴스 & 경제</p>
      <div>
        {/* <FooterLink href="/terms">이용약관</FooterLink>| */}
        {/* <FooterLink href="/privacy">개인정보 처리방침</FooterLink>| */}
        <FooterLink
          href="https://mail.google.com/mail/?view=cm&fs=1&to=choijihwan14@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          문의하기
        </FooterLink>
      </div>
    </FooterContainer>
  );
};
