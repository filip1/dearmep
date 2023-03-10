
// Matches: "http://", "HTTPS://", "file://", "//", ...
const absoluteUrlRegexp = /^([A-Za-z]+:\/\/|\/\/)/

export class UrlUtil {
  public static isAbsolute(url: string): boolean {
      return !!url.match(absoluteUrlRegexp)
  }

  public static toAbsolute(relativeUrl: string, baseUrl: string): string {
    return new URL(relativeUrl, baseUrl).toString()
  }
}
