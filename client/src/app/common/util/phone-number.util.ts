export class PhoneNupmberUtil {
  /**
   * Naive phone number anonymization by masking characters in certain places.
   * '+43 664 1234567' => '+43 664 12***67'
   */
  public static MaskPhoneNumber(number: string): string {
    const maskChar = '*';
    const maskLen = 3; // Mask this many characters
    const tailLen = 2; // Leave this many characters at the end unmasked

    const head = number.slice(0, (maskLen + tailLen) * -1);
    const maskStr = maskChar.repeat(maskLen);
    const tail = number.slice(tailLen * -1);

    return head + maskStr + tail;
  }
}
