import Logger from "easylogger-ts";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { Container } from "reactstrap";
import APIMiddleware from "../../misc/APIMiddleware";
import Config from "../../misc/config";
import { SubmissionCarousel, SubmissionSlide } from "../SubmissionCarousel";
import "./SubmissionFullView.scss";

interface SubmissionFullViewProps {
  imageUrl: string;
  imageMimetype?: string;
  onClick?: MouseEventHandler;
  dootDifference: number;
}
type SubmissionFullViewType = React.FunctionComponent<SubmissionFullViewProps>;
const SubmissionFullView: SubmissionFullViewType = (
  props: SubmissionFullViewProps
) => {
  if (
    !Config.api.storeSubmissionsLocally && !props.imageMimetype
    )
   {
    Logger.error(`SubmissionFullView: props.imageUrl && \
        props.imageMimetype required when not storing submissions \
        locally! Props provided: ${Logger.objectToPrettyStringSync(
          props as Record<string, any>
        )}`);
  }
  const [imageSrc, setImageSrc] = useState("");
  useEffect(() => {
    (async () =>
      Config.api.storeSubmissionsLocally
        ? await APIMiddleware.formatSlackImageSrc(props.imageUrl)
        : await APIMiddleware.formatSlackImageSrc(
            props.imageUrl,
            props.imageMimetype
          ))().then((imageSrc) => {
      setImageSrc(imageSrc);
    });
  }, [imageSrc, props.imageUrl]);
  return (
    <Container>
      <span className="submission-full-view-close-indicator">X</span>
      <SubmissionCarousel
        maxItemCount={1}
        onClick={props.onClick}
        id="submission-full-view"
      >
        <SubmissionSlide
          src={
            Config.api.storeSubmissionsLocally
              ? imageSrc
              : `data:${props.imageMimetype};base64, ${imageSrc}`
          } // Should turn this to a function to formatB64ToSrc
          dootDifference={props.dootDifference}
        />
      </SubmissionCarousel>
    </Container>
  );
};

export default SubmissionFullView;
