import { useState, useEffect, MouseEventHandler } from "react";
import { Card, CardImg, CardBody, CardTitle, CardText } from "reactstrap";
import Logger from "easylogger-ts";
import APIMiddleware, { getSlackImageBase64 } from "../../misc/APIMiddleware";
import "./SubmissionCard.scss";
import Config from "../../misc/config";
type SubmissionCardPropTypes = {
  id?: string;
  author: string;
  thumbnailUrl: string;
  thumbnailMimetype?: string; // Required if Config.api.storeSubmissionsLocally=false
  apiPublicFileUrl?: string; // Required if Config.api.storeSubmissionsLocally=true
  onClick: MouseEventHandler;
  children?: string;
};

const SubmissionCard = (props: SubmissionCardPropTypes) => {
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  useEffect(() => {
    (async () => {
      let thumbnailB64;
      if (Config.api.storeSubmissionsLocally) {
        if (!props.thumbnailMimetype) {
          throw new Error(
            "SubmissionCard: props.thumbnailMimetype required if Config.api.storeSubmissionsLocally=false"
          );
        }
        thumbnailB64 = await APIMiddleware.getSlackImageBase64(
          props.thumbnailUrl,
          true
        );
      } else if (!props.apiPublicFileUrl) {
        throw new Error(
          "SubmissionCard: props.thumbnailMimetype required if Config.api.storeSubmissionsLocally=false"
        );
      }
      const thumbnail = thumbnailB64
        ? `data:${props.thumbnailMimetype};base64, ${thumbnailB64}`
        : props.apiPublicFileUrl;
      if (!thumbnail)
        throw new Error(
          `SubmissionCard: Failed to get thumbnail for unknown reason, props.apiPublicFileUrl possibly undefined (props.apiPublicFileUrl=${props.apiPublicFileUrl})`
        );
      setThumbnailUrl(thumbnail);
    })().catch((err: string) => Logger.log(err));
  }, [props.thumbnailUrl, props.thumbnailMimetype]);
  return (
    <Card id={props.id} className="submission-card" style={{ width: "18rem" }}>
      <div className="image-container">
        <CardImg variant="top" src={thumbnailUrl} onClick={props.onClick} />
      </div>
      <hr className="my-0" />
      <CardBody>
        <CardTitle>
          Author: <span className="author-name-text">{props.author}</span>
        </CardTitle>
        <CardText>{props.children}</CardText>
      </CardBody>
    </Card>
  );
};

export default SubmissionCard;
