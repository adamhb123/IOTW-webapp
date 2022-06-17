import React, {
  MouseEventHandler,
  ReactElement,
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

export const AbsoluteDootDifferenceDisplay = (props: {
  absoluteDootDifference: number;
}) => (
  <div className="absolute-doot-difference-display">
    <span className="bidi-arrow">⬍</span>
    <span className="absolute-doot-difference-text">
      {props.absoluteDootDifference}
    </span>
  </div>
);

interface SubmissionSlideProps {
  src: string;
  absoluteDootDifference: number;
  onClick?: MouseEventHandler;
}

type SubmissionSlideType = React.FunctionComponent<SubmissionSlideProps>;

export const SubmissionSlide: SubmissionSlideType = (
  props: SubmissionSlideProps
) => {
  //{props.caption ? (
  // ) : null}
  //<span className="slide-caption">{props.caption}</span>

  return (
    <div className="slide">
      <AbsoluteDootDifferenceDisplay
        absoluteDootDifference={props.absoluteDootDifference}
      />
      <img src={props.src} onClick={props.onClick} />
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
        let imageB64;
        if (!Config.api.storeSubmissionsLocally) {
          imageB64 = await APIMiddleware.getSlackImageBase64(
            submission.imageUrl
          );
        }
        const imageSrc = imageB64
          ? APIMiddleware.formatSlackImageSrc(imageB64, submission.imageMimetype)
          : APIMiddleware.formatSlackImageSrc(submission.apiPublicFileUrl);

        subSlides.push(
          <SubmissionSlide
            src={imageSrc}
            absoluteDootDifference={submission.updoots - submission.downdoots}
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
      <Slider {...settings}>{slides}</Slider>
    </Container>
  );
};

export default SubmissionCarousel;
