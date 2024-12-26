import { PipelineParamsTypes } from "../../saas/types";

export type GpaiBiasTypes = PipelineParamsTypes & {
  app: "gpai";
  dataset: string;
  model: string;
  columnInput: {
    [key: string]: string;
  };
};
