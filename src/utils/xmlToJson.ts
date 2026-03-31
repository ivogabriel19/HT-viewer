import { XMLParser } from "fast-xml-parser"

const parser = new XMLParser({
  ignoreAttributes: false,
})

export const xmlToJson = <T = any>(xmlData: string): T => {
  return parser.parse(xmlData)
}