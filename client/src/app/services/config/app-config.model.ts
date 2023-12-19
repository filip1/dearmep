import { FrontendSetupResponse } from "src/app/api/models"

export interface AppConfig extends FrontendSetupResponse {
  // { "AT": "+43", "DE": "+49", ... }
  availableCallingCodes: {
    [key: string]: string
  }
}
