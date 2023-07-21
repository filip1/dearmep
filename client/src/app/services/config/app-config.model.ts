export interface AppConfig {
  // { "AT": "+43", "DE": "+49", ... }
  availableCallingCodes: {
    [key: string]: string
  }
}
