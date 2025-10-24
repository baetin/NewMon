import {
  Container,
  Left,
  Right,
} from "../../../shared/styles/articleContents.styles";
import { HotTopicList } from "../../../widgets/Home/ui/HotTopic/HotTopic";
import { MainArticle } from "../../../widgets/Home/ui/MainArticle/MainArticle";

const HomePage = () => {
  return (
    <Container>
      <Left>
        <MainArticle />
      </Left>
      <Right>
        <HotTopicList />
      </Right>
    </Container>
  );
};

export default HomePage;
