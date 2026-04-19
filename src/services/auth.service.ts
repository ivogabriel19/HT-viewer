import { createOAuthConsumer, getAuthorizationUrl } from "../utils/hattrickClient"

export { getAuthorizationUrl }

export const getRequestToken = (): Promise<{ token: string; tokenSecret: string }> => {
  const consumer = createOAuthConsumer()
  return new Promise((resolve, reject) => {
    consumer.getOAuthRequestToken((error, token, tokenSecret) => {
      if (error) return reject(new Error(`Failed to get request token: ${JSON.stringify(error)}`))
      resolve({ token, tokenSecret })
    })
  })
}

export const exchangeForAccessToken = (
  requestToken: string,
  requestTokenSecret: string,
  verifier: string
): Promise<{ accessToken: string; accessTokenSecret: string }> => {
  const consumer = createOAuthConsumer()
  return new Promise((resolve, reject) => {
    consumer.getOAuthAccessToken(requestToken, requestTokenSecret, verifier, (error, accessToken, accessTokenSecret) => {
      if (error) return reject(new Error(`Failed to get access token: ${JSON.stringify(error)}`))
      resolve({ accessToken, accessTokenSecret })
    })
  })
}