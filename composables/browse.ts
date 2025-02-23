import { BrowseApi } from "@bcc-code/bmm-sdk-fetch";

export function useBrowse() {
  return reactiveApi(
    useLazyAsyncData("browse", () => new BrowseApi().browseGet()),
  );
}

export function useBrowseEvents() {
  return reactiveApi(
    useLazyAsyncData("browse-events", () => new BrowseApi().browseEventsGet()),
  );
}

export function useBrowseAudiobooks() {
  return reactiveApi(
    useLazyAsyncData("browse-audiobooks", () =>
      new BrowseApi().browseAudiobooksGet(),
    ),
  );
}

export function useBrowseMusic() {
  return reactiveApi(
    useLazyAsyncData("browse-music", () => new BrowseApi().browseMusicGet()),
  );
}

export function useBrowsePodcast() {
  return reactiveApi(
    useLazyAsyncData("browse-podcast", () =>
      new BrowseApi().browsePodcastsGet(),
    ),
  );
}
