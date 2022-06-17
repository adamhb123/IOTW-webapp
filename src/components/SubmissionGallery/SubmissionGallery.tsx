import React, { useEffect, useState, useCallback, ReactElement } from "react";
import ReactPaginate from "react-paginate";
import { Container, Row } from "reactstrap";
import { useOidcUser } from "@axa-fr/react-oidc";
import Logger from "easylogger-ts";
import SubmissionCard from "./SubmissionCard";
import APIMiddleware, {
  MediaResponseStructure,
} from "../../misc/APIMiddleware";
import InfoModal from "../InfoModal";
import "./SubmissionGallery.scss";
import SubmissionFullView from "../SubmissionFullView";
import Config from "../../misc/config";
const ROW_COUNT = 5;
const COLUMN_COUNT = 3; // Once max card amount has been reached (ROW_COUNT * COLUMN_COUNT), we will paginate the rest
const SUBFETCH_INTERVAL_MS = 5000;
let LAST_SUBFETCH_SUCCESSFUL = false;
let SUBFETCH_ATTEMPT_COUNT = 0;

const SubFetchFailure = () => (
  <InfoModal title="Submission Update Failure">
    Failed to retrieve latest submissions!
  </InfoModal>
);

const Items = (props: { currentItems: MediaResponseStructure[] }) => {
  const [
    submissionFullView,
    setSubmissionFullView,
  ] = useState<ReactElement | null>(null);
  const unsetOnClick = useCallback(
    async (item: MediaResponseStructure) => setSubmissionFullView(null),
    []
  );
  const setOnClick = useCallback(async (item: MediaResponseStructure) => {
    setSubmissionFullView(
      <SubmissionFullView
        imageUrl={
          Config.api.storeSubmissionsLocally
            ? item.apiPublicFileUrl
            : item.imageUrl
        }
        dootDifference={item.updoots - item.downdoots}
        imageMimetype={item.imageMimetype}
        onClick={unsetOnClick.bind(null, item)}
      />
    );
  }, []);
  return (
    <Row>
      {submissionFullView}
      {props.currentItems &&
        !submissionFullView &&
        props.currentItems.map((item: MediaResponseStructure) => (
          <SubmissionCard
            key={item.thumbnailUrl}
            author={item.cshUsername}
            thumbnailUrl={item.thumbnailUrl}
            thumbnailMimetype={item.thumbnailMimetype}
            onClick={setOnClick.bind(null, item)}
          >
            Test f
          </SubmissionCard>
        ))}
    </Row>
  );
};

interface PaginatedItemProps {
  itemsPerPage: number;
  userOnly?: boolean;
}
type PaginatedItemType = React.FunctionComponent<PaginatedItemProps>;
const PaginatedItems: PaginatedItemType = (props: PaginatedItemProps) => {
  // We start with an empty list of items.
  const [currentItems, setCurrentItems] = useState<any>(null);
  const [pageCount, setPageCount] = useState(0);
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);
  const [items, setItems] = useState([] as MediaResponseStructure[]);
  const oidcUser = useOidcUser().oidcUser;
  useEffect(() => {
    const subFetch = () =>
      (async () => {
        let submissions;
        console.log(props.userOnly);
        if (props.userOnly)
          submissions = await APIMiddleware.getSubmissionByColumnValue(
            "cshUsername",
            oidcUser.preferred_username
          );
        else submissions = await APIMiddleware.getSubmissions();
        setItems(submissions);
        LAST_SUBFETCH_SUCCESSFUL = true;
      })().catch((err) => {
        Logger.error("Submission retrieval failed");
        LAST_SUBFETCH_SUCCESSFUL = false;
        SUBFETCH_ATTEMPT_COUNT++;
        const maxRetries = APIMiddleware.getMaxRetries();
        if (SUBFETCH_ATTEMPT_COUNT >= maxRetries) {
          Logger.error(
            `Reached max failed fetch limit (${maxRetries}). Refresh to try again.`
          );
          return;
        }
        setTimeout(subFetch, SUBFETCH_INTERVAL_MS);
      });
    subFetch();
  }, []);
  useEffect(() => {
    const endOffset = itemOffset + props.itemsPerPage;
    // Logger.log(
    //   `Items: ${items.map((submission: MediaResponseStructure) =>
    //     Logger.objectToPrettyString(submission as Record<string, any>)
    //   )}`
    // );
    Logger.log(`Loading items from ${itemOffset} to ${endOffset}`);
    setCurrentItems(items.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(items.length / props.itemsPerPage));
  }, [itemOffset, props.itemsPerPage, items]);

  // Invoke when user click to request another page.
  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * props.itemsPerPage) % items.length;
    Logger.debug(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };

  return (
    <>
      <Items currentItems={currentItems} />
      <ReactPaginate
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="< previous"
        renderOnZeroPageCount={() => null}
      />
      {!LAST_SUBFETCH_SUCCESSFUL &&
      SUBFETCH_ATTEMPT_COUNT >= APIMiddleware.getMaxRetries() ? (
        <SubFetchFailure />
      ) : null}
    </>
  );
};

type SubmissionGalleryProps = { userOnly: boolean; title: string };

const SubmissionGallery: React.FunctionComponent<SubmissionGalleryProps> = (
  props: SubmissionGalleryProps
) => (
  <Container className="submission-display">
    <h1>{props.title}</h1>
    <PaginatedItems itemsPerPage={4} />
  </Container>
);

export default SubmissionGallery;
