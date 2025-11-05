import {
  Container,
  Left,
  Right,
} from "../../../shared/styles/articleContents.styles";
import { MainArticle } from "../../../widgets/Home/ui/MainArticle/MainArticle";
import { MainRightSection } from "../../../widgets/Home/ui/MainRightSection/MainRightSection";

const HomePage: React.FC = () => {
  return (
    <Container>
      <Left>
        <MainArticle />
      </Left>
      <Right>
        <MainRightSection />
      </Right>
    </Container>
  );
};

export default HomePage;
