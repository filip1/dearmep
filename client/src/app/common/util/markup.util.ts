export class MarkupUtil {
  public static NoWrap(str?: string): string | undefined {
    if (!str) {
      return str
    }
    return `<span class="dmep-nowrap">${str}</span>`
  }
}
