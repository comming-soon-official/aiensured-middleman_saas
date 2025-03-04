import { Request, Response } from "express";
import { chdir } from "process";
import { PIPELINE_PATH } from "../../constant/paths";
import { StructuredPipelineTypes } from "./types";
import { handleFailure } from "../../services/api-actions";
import { downloadDataset, downloadModel } from "../../common/downloadOps";
import { setConfigs } from "../../common/setConfigs";
import { RunPipeline } from "../../common/executables";

export const runStructured = async (req: Request, res: Response) => {
  try {
    const { dataset, pipeline, columnInput } =
      req.body as StructuredPipelineTypes;

    // Validate pipeline type
    if (pipeline !== "structured") {
      return res.status(400).json({
        success: false,
        message: 'Invalid pipeline type. Expected "structured"',
      });
    }

    //Changing to Pipelines Directory
    chdir(PIPELINE_PATH);

    // Download dataset and model
    await downloadDataset({ url: dataset });
    await setConfigs({ pipeline, colInput: JSON.stringify(columnInput) });

    await downloadModel({ url: dataset, pipeline });

    await RunPipeline({ pipeline });
    return res.status(200).json({
      success: true,
      message: "Image pipeline executed successfully",
    });
  } catch (error) {
    console.error("Error in image pipeline:", error);
    await handleFailure({
      reason: `Error in Structured pipeline: ${error}`,
    });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
