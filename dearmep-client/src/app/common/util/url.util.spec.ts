import { UrlUtil } from './url.util';

const absoluteUrls = [
  "http://server.example/",
  "HTTP://server.example",
  "FTP://server.example/",
  "//server.example/",
]
const relativeUrls = [
  "/",
  "assets/",
  "image.jpg",
  "assets/script.js",
  "/assets/script.js",
  "../icons/logo.gif"
]

describe('UrlUtil', () => {
  describe('isAbsolute' , () => {
    for (const absUrl of absoluteUrls) {
      it(`should classify "${absUrl}" as absolute`, () => {
        expect(UrlUtil.isAbsolute(absUrl)).toBeTrue()
      });
    }

    for (const relUrl of relativeUrls) {
      it(`should classify "${relUrl}" as relatie`, () => {
        expect(UrlUtil.isAbsolute(relUrl)).toBeFalse()
      });
    }
  })

  describe('toAbsolute', () => {
    it('should avoid double slashes', () => {
      expect(UrlUtil.toAbsolute("/assets", "http://localhost/")).toBe("http://localhost/assets")
    })

    it('should handle missing slashes', () => {
      expect(UrlUtil.toAbsolute("assets", "http://localhost")).toBe("http://localhost/assets")
    })

    it('should handle base-url with sub-folder', () => {
      expect(UrlUtil.toAbsolute("styles.css", "http://localhost/static")).toBe("http://localhost/static/styles.css")
    })

    it('should handle base-url with sub-folder', () => {
      expect(UrlUtil.toAbsolute("styles.css", "http://localhost/static")).toBe("http://localhost/static/styles.css")
    })

    it('should handle base-url with sub-folder (trailing slash)', () => {
      expect(UrlUtil.toAbsolute("styles.css", "http://localhost/static/")).toBe("http://localhost/static/styles.css")
    })

    it('should handle base-url with sub-folder (url starting with dot slash)', () => {
      expect(UrlUtil.toAbsolute("./styles.css", "http://localhost/static")).toBe("http://localhost/static/styles.css")
    })

    it('should handle absolute urls', () => {
      expect(UrlUtil.toAbsolute("http://example.com/abc", "http://localhost/static")).toBe("http://example.com/abc")
    })

    it('should handle absolute urls (undefined base-url)', () => {
      expect(UrlUtil.toAbsolute("http://example.com/abc", undefined)).toBe("http://example.com/abc")
    })

    it('should handle relative base url', () => {
      for (const relUrl of relativeUrls) {
        expect(() => UrlUtil.toAbsolute("style.css", relUrl)).toThrowError("Failed to construct 'URL': Invalid base URL")
      }
    })
  })
});
