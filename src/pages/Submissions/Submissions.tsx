import React from "react";
import { Container } from "reactstrap";
import { SubmissionGallery } from "../../components/SubmissionGallery";
import "./Submissions.scss";
const ROW_COUNT = 5;
const COLUMN_COUNT = 3; // Once max card amount has been reached, we will paginate the rest

type SubmissionsProps = { userOnly: boolean };

const Submissions: React.FunctionComponent<SubmissionsProps> = (
  props: SubmissionsProps
) => (
  <Container>
    <SubmissionGallery userOnly title="Your Submissions"></SubmissionGallery>
  </Container>
);

export default Submissions;
