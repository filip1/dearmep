export class MarkupUtil {
  public static NoWrap(
    str: string | null | undefined,
    classNames = 'dmep-nowrap'
  ): string | null | undefined {
    if (!str) {
      return str;
    }
    return `<span class="${classNames}">${str}</span>`;
  }
}
