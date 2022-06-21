import React, { useEffect } from "react";
import "./SubmissionFullOverlay.scss";

interface SubmissionFullOverlayProps {
  id?: string;
  className?: string;
  onClick?: React.MouseEventHandler;
  src: string;
}
type SubmissionFullOverlayType = React.FunctionComponent<SubmissionFullOverlayProps>;
export const SubmissionFullOverlay: SubmissionFullOverlayType = (
  props: SubmissionFullOverlayProps
) => {
  const [visible, setVisible] = React.useState<boolean>(false);
  const [src, setSrc] = React.useState<string>("");
  useEffect(() => {
    const dom = (document as any);
    dom.setSubmissionFullOverlaySrc = setSrc;
    dom.setSubmissionFullOverlayVisible = setVisible;
    dom.submissionFullOverlayVisible = visible;
  }, [visible, src]);
  
  const toggleVisibility = React.useCallback(() => setVisible(!visible), [visible]);
  return (
    <div
      id={props.id ?? ""}
      className={`submission-full-overlay ${props.className ?? ""}`}
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      <img src={src} onClick={toggleVisibility}></img>
    </div>
  );
};

export default SubmissionFullOverlay;
