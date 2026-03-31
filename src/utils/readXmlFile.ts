import fs from "fs"
import path from "path"

export const readXmlFile = (relativePath: string): string => {
  const filePath = path.join(__dirname, "..", relativePath)
  return fs.readFileSync(filePath, "utf-8")
}