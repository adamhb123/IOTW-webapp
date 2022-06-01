import { Card, CardImg, CardBody, CardTitle, CardText, Button } from "reactstrap";
type SubmissionCardPropTypes = {
    id: string;
    title: string;
    image: string;
    children: string;
}
const SubmissionCard = (props: SubmissionCardPropTypes) => (
    <Card id={props.id} className="submission-card" style={{ width: '18rem' }}>
        <CardImg variant="top" src={props.image} />
        <CardBody>
            <CardTitle>{props.title}</CardTitle>
            <CardText>{props.children}</CardText>
        </CardBody>
    </Card>
);

export default SubmissionCard
