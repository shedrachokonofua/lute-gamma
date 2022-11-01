const isSubPath = (url, subPath) => {
  return (
    url.pathname.startsWith(subPath) && url.pathname.length > subPath.length
  );
};

const shouldSave = (urlStr) => {
  const url = new URL(urlStr);

  return (
    url.hostname === "rateyourmusic.com" &&
    (isSubPath(url, "/release/album/") ||
      isSubPath(url, "/release/mixtape/") ||
      isSubPath(url, "/release/ep/") ||
      isSubPath(url, "/artist/") ||
      isSubPath(url, "/charts/")) &&
    !url.pathname.endsWith("/buy/")
  );
};

const getFileName = (url) =>
  new URL(url).pathname
    .split("/")
    .filter((x) => x !== "")
    .join("/") + ".mhtml";

const FILE_SERVER_URL = "http://localhost:4000/files";

const upload = (url, mhtml) => {
  const formData = new FormData();
  formData.append("name", getFileName(url));
  formData.append("file", mhtml);

  fetch(FILE_SERVER_URL, {
    method: "POST",
    body: formData,
  });
};

const getCanUpload = async (url) => {
  const name = getFileName(url);
  const res = await fetch(`${FILE_SERVER_URL}/exists?name=${name}`);
  const json = await res.json();
  return !json.data.exists;
};

const onTabLoad = async (tabId, tab) => {
  const { url } = tab;
  if (shouldSave(url) && (await getCanUpload(url))) {
    chrome.pageCapture.saveAsMHTML({ tabId }, (mhtml) => {
      upload(tab.url, mhtml);
    });
  }
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    onTabLoad(tabId, tab);
  }
});
