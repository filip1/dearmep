import { Injectable } from '@angular/core';
import { AppConfig } from './app-config.model';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // config will be loaded from the backend in the future
  private readonly defaultConfig: AppConfig = {
    availableCallingCodes: { 
      BE: "+32", 
      BG: "+359", 
      CZ: "+420", 
      DK: "+45", 
      DE: "+49", 
      EE: "+372", 
      IE: "+353", 
      GR: "+30", 
      ES: "+34", 
      FR: "+33", 
      HR: "+385", 
      IT: "+39", 
      CY: "+357", 
      LV: "+371", 
      LT: "+370", 
      LU: "+352", 
      HU: "+36", 
      MT: "+356", 
      NL: "+31", 
      AT: "+43", 
      PL: "+48", 
      PT: "+351", 
      RO: "+40", 
      SI: "+386", 
      SK: "+421", 
      FI: "+358", 
      SE: "+46",
    }
  }

  private readonly config$ = new ReplaySubject<AppConfig>()

  constructor() {
    this.config$.next(this.defaultConfig)
  }

  public getConfig$(): Observable<AppConfig> {
    return this.config$.asObservable()
  }
}
