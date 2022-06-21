import React, {
  MouseEventHandler,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./SubmissionCarousel.scss";

import APIMiddleware from "../../misc/APIMiddleware";
import Logger from "easylogger-ts";
import { Container } from "reactstrap";
import Config from "../../misc/config";
import SubmissionFullOverlay from "../SubmissionFullOverlay";
import { isPropertySignature } from "typescript";

// export class SubmissionCarouselItem {
//   src: string;
//   altText: string;
//   caption: string;
//   constructor(src: string, altText: string, caption: string) {
//     this.src = src;
//     this.altText = altText;
//     this.caption = caption;
//   }
//   asObject() {
//     return {
//       src: this.src,
//       altText: this.altText,
//       caption: this.caption,
//     };
//   }
// }

// export class SubmissionCarousel extends Component<SubmissionCarouselProps> {
//   maxItemCount: number;
//   animating: boolean;
//   state: {activeIndex: number; items: SubmissionCarouselItem[]} = { activeIndex: 0, items: [] };
//   constructor(props: SubmissionCarouselProps) {
//     super(props);
//     this.next = this.next.bind(this);
//     this.previous = this.previous.bind(this);
//     this.goToIndex = this.goToIndex.bind(this);
//     this.onExiting = this.onExiting.bind(this);
//     this.onExited = this.onExited.bind(this);
//     this.animating = false;
//     this.maxItemCount = props.maxItemCount;
//     this.updateItems();
//   }

//   async updateItems() {
//     const submissions = await APIMiddleware.getSubmissions(this.maxItemCount);
//     this.state.items = await Promise.all(
//       submissions.map(async (submission: MediaResponseStructure) => {
//         const imageB64 = await APIMiddleware.getSlackImageBase64(submission.imageUrl);
//         return new SubmissionCarouselItem(
//           `data:${submission.imageMimetype};base64, ${imageB64}`,
//           `Slack image from url: ${submission.imageUrl}`,
//           `^${submission.updoots} v${submission.downdoots}`
//         )
//       })
//     );
//   }

//   onExiting() {
//     this.animating = true;
//   }

//   onExited() {
//     this.animating = false;
//   }

//   next() {
//     if (this.animating) return;
//     const nextIndex =
//       this.state.activeIndex === this.state.items.length - 1
//         ? 0
//         : this.state.activeIndex + 1;
//     this.setState({ activeIndex: nextIndex });
//   }

//   previous() {
//     if (this.animating) return;
//     const nextIndex =
//       this.state.activeIndex === 0
//         ? this.state.items.length - 1
//         : this.state.activeIndex - 1;
//     this.setState({ activeIndex: nextIndex });
//   }

//   goToIndex(newIndex: number) {
//     if (this.animating) return;
//     this.setState({ activeIndex: newIndex });
//   }

//   render() {
//     const { activeIndex } = this.state;

//     const slides = this.state.items.map((item) => {
//       return (
//         <CarouselItem
//           onExiting={this.onExiting}
//           onExited={this.onExited}
//           key={item.src}
//         >
//           <img src={item.src} alt={item.altText} />
//           <CarouselCaption
//             captionText={item.caption}
//             captionHeader={item.caption}
//           />
//         </CarouselItem>
//       );
//     });

//     return (
//       <Carousel
//         activeIndex={activeIndex}
//         next={this.next}
//         previous={this.previous}
//       >
//         <CarouselIndicators
//           items={this.state.items}
//           activeIndex={activeIndex}
//           onClickHandler={this.goToIndex}
//         />
//         {slides}
//         <CarouselControl
//           direction="prev"
//           directionText="Previous"
//           onClickHandler={this.previous}
//         />
//         <CarouselControl
//           direction="next"
//           directionText="Next"
//           onClickHandler={this.next}
//         />
//       </Carousel>
//     );
//   }
// }

export const DootDifferenceDisplay = (props: { dootDifference: number }) => (
  <div className="doot-difference-display">
    <span className="doot-difference-text">
      <span className="bidi-arrow">⬍</span>
      {props.dootDifference}
    </span>
  </div>
);

interface SubmissionSlideProps {
  src: string;
  dootDifference: number;
  onClick?: MouseEventHandler;
}

type SubmissionSlideType = React.FunctionComponent<SubmissionSlideProps>;

export const SubmissionSlide: SubmissionSlideType = (
  props: SubmissionSlideProps
) => {
  //{props.caption ? (
  // ) : null}
  //<span className="slide-caption">{props.caption}</span>
  const toggleShowFullOverlayOnClick = () => {
    const dom = (document as any);
    dom.setSubmissionFullOverlaySrc(props.src);
    dom.setSubmissionFullOverlayVisible(!dom.submissionFullOverlayVisible);
  };
  return (
    <div className="slide">
      <DootDifferenceDisplay dootDifference={props.dootDifference} />
      <img
        src={props.src}
        onClick={toggleShowFullOverlayOnClick}
      />
    </div>
  );
};

interface SubmissionCarouselProps {
  maxItemCount: number;
  autoplay?: boolean;
  onClick?: MouseEventHandler;
  id?: string;
  children?: ReactElement[] | ReactElement;
}

export const SubmissionCarousel: React.FunctionComponent<SubmissionCarouselProps> = (
  props: SubmissionCarouselProps
) => {
  // Load submissions
  const [slides, setSlides] = useState<ReactElement[]>([]);
  useEffect(() => {
    (async (): Promise<ReactElement[]> => {
      const subSlides: ReactElement[] = props.children
        ? Array.isArray(props.children)
          ? props.children
          : [props.children]
        : [];
      const presetSlidesLength = subSlides.length;
      if (presetSlidesLength >= props.maxItemCount) return subSlides;
      const submissionObjs = await APIMiddleware.getSubmissions(
        props.maxItemCount - presetSlidesLength
      );
      for (const submission of submissionObjs) {
        let imageSrc: string;
        Logger.error(Config.api.storeSubmissionsLocally);
        if (Config.api.storeSubmissionsLocally) {
          if (!submission.apiPublicFileUrl) {
            const errStr = `SubmissionCardCarousel: props.apiPublicFileUrl required \
            when storing submissions locally! Props provided: ${Logger.objectToPrettyStringSync(
              props as Record<string, any>
            )}`;
            Logger.error(errStr);
            throw new Error(errStr);
          } else {
            await Logger.warn(submission.apiPublicFileUrl);
            imageSrc = APIMiddleware.formatSlackImageSrc(
              submission.apiPublicFileUrl
            );
          }
        } else {
          if (!(submission.imageUrl && submission.imageMimetype)) {
            const errStr = `SubmissionCardCarousel: props.imageUrl && \
            props.imageMimetype required when not storing submissions \
            locally! Props provided: ${Logger.objectToPrettyStringSync(
              props as Record<string, any>
            )}`;
            Logger.error(errStr);
            throw new Error(errStr);
          } else {
            await Logger.warn(submission.imageMimetype);
            imageSrc = APIMiddleware.formatSlackImageSrc(
              await APIMiddleware.getSlackImageBase64(submission.imageUrl),
              submission.imageMimetype
            );
          }
        }
        subSlides.push(
          <SubmissionSlide
            src={imageSrc}
            dootDifference={submission.updoots - submission.downdoots}
          />
        );
      }
      return subSlides;
    })()
      .then((subSlides) => setSlides(subSlides))
      .catch((err) => Logger.error(err));
  }, [props.children, props.maxItemCount]);
  const settings = {
    autoplay: props.autoplay ?? false,
    arrows: true,
    accessibility: true, // Doesn't work i guess
    dots: true,
    infinite: true,
    speed: 500,
    slide: ".slide",
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  // Add onclick to slider
  useEffect(
    () =>
      document
        .getElementsByClassName("slick-slider")[0]
        .addEventListener("click", (ev: any) => {
          if (props.onClick) props.onClick(ev);
        }),
    []
  );
  return (
    <Container id={props.id}>
      <SubmissionFullOverlay src={""}/>
      <Slider {...settings}>{slides}</Slider>
    </Container>
  );
};

export default SubmissionCarousel;
