import { Container } from "reactstrap";
import APIMiddleware from "../../misc/APIMiddleware";
import { SubmissionCarousel } from "../../components/SubmissionCarousel"

const getSubmissionCarouselItems = async (count: number = 5) => {
  const submissions = await APIMiddleware.getSubmissions(count);
  return submissions;
}

const Home: React.FunctionComponent = () => {
  const items = getSubmissionCarouselItems();
  return (
    <Container>
      <SubmissionCarousel maxItemCount={5}/>
    </Container>
  );
}

export default Home;
