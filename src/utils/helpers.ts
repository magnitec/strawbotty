import fs from "fs";
import { readdir } from "fs/promises";

export const getDirNames = async (source: fs.PathLike) =>
  (await readdir(source, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory() && dirent.name !== "__pycache__")
    .map((dirent) => dirent.name);
