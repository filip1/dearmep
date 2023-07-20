
// Matches: "http://", "HTTPS://", "file://", "//", ...
const absoluteUrlRegexp = /^([A-Za-z]+:\/\/|\/\/)/

export class UrlUtil {
  public static isAbsolute(url: string): boolean {
      return !!url.match(absoluteUrlRegexp)
  }

  public static toAbsolute(url: string, baseUrl?: string): string {
    // Turn "http://localhost/static" into "http://localhost/static/" because otherwise the 
    // pathname "/static" will be removed from the base-url
    if (baseUrl && !baseUrl.endsWith("/")) {
      baseUrl += "/"
    }

    const u = new URL(url, baseUrl)
    return u.toString()
  }
}
