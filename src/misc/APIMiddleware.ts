import Config from "./config";

export enum SortedBy {
    Updoots="updoots",
    Downdoots="downdoots",
    DootDifference="doot-difference",
};

export enum Direction {
    Ascending="ascending",
    Descending="descending",
}

export const getSubmissions = (direction?: Direction, sortedBy?: SortedBy) => {
    // Retrieve submissions, sorting is handled server-side by iotw-api
    const queryParams = `sortedBy=${sortedBy ?? SortedBy.Updoots}&direction=${direction ?? Direction.Descending}`;
    fetch(`${Config.api.host}:${Config.api.port}/?${queryParams}`)
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    });
};

export default { getSubmissions };