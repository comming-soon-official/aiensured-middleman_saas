export type DownloadModelTypes = {
  app?: "saas" | "gpai";
  url: string;
  pipeline: "image" | "structured";
};

export type UploadS3Types = {
  app?: "saas" | "gpai";
  pipeline: "image" | "structured";
};
