import fs from "fs";
import path from "path";

import { handleFailure } from "../services/api-actions";
import { executeCommand } from "./executables";
import { DownloadModelTypes } from "./types";
import { setConfigs } from "./setConfigs";
import { settingStore } from "../store";

export const downloadModel = async ({ url, pipeline }: DownloadModelTypes) => {
  const filename = path.basename(url);
  const fileExtension = path.extname(filename);
  const staticFilename = `model${fileExtension}`;
  let targetFolder: string;
  switch (pipeline) {
    case "image":
      targetFolder = "./Results/Model";
      break;
    default:
      targetFolder = "./results/model_paths";
  }

  try {
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    await executeCommand(
      `curl -s ${url} --output ${targetFolder}/${staticFilename}`
    );
    console.log("model downloaded");
  } catch (error) {
    console.error("Error in downloadAndMoveModel:", error);
    await handleFailure({
      reason: `Error in downloadAndMoveModel: ${error}`,
    });
  }
};

export const downloadDataset = async ({ url }: { url: string }) => {
  const filename = path.basename(url);
  const fileExtension = path.extname(filename);
  const staticFilename = `dataset${fileExtension}`;
  const targetFolder = "./datasets";

  try {
    settingStore({ fileName: staticFilename });
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    await executeCommand(
      `curl -s ${url} --output ${targetFolder}/${staticFilename}`
    );
    console.log("dataset downloaded");
  } catch (error) {
    console.error("Error on Downloading Datasets", error);
    await handleFailure({
      reason: `Error in Downloading : ${error}`,
    });
  }
};
