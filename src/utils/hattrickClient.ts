import { OAuth } from "oauth"
import { env } from "../config/env"

const CHPP_REQUEST_TOKEN_URL = "https://chpp.hattrick.org/oauth/request_token.ashx"
const CHPP_ACCESS_TOKEN_URL = "https://chpp.hattrick.org/oauth/access_token.ashx"
const CHPP_AUTHORIZE_URL = "https://chpp.hattrick.org/oauth/authorize.aspx"
const CHPP_API_URL = "https://chpp.hattrick.org/chppxml.ashx"

export const createOAuthConsumer = () =>
  new OAuth(
    CHPP_REQUEST_TOKEN_URL,
    CHPP_ACCESS_TOKEN_URL,
    env.CHPP_CONSUMER_KEY,
    env.CHPP_CONSUMER_SECRET,
    "1.0A",
    env.CHPP_CALLBACK_URL,
    "HMAC-SHA1"
  )

export const getAuthorizationUrl = (requestToken: string) =>
  `${CHPP_AUTHORIZE_URL}?oauth_token=${requestToken}`

export const fetchFromChpp = (
  file: string,
  accessToken: string,
  accessTokenSecret: string,
  params: Record<string, string> = {}
): Promise<string> => {
  const consumer = createOAuthConsumer()
  const query = new URLSearchParams({ file, ...params }).toString()
  const url = `${CHPP_API_URL}?${query}`

  return new Promise((resolve, reject) => {
    consumer.get(url, accessToken, accessTokenSecret, (error, data) => {
      if (error) return reject(new Error(`CHPP API error: ${JSON.stringify(error)}`))
      resolve(data as string)
    })
  })
}