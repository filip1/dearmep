import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/api/services';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Observable, firstValueFrom, shareReplay } from 'rxjs';
import { FrontendSetupResponse } from 'src/app/api/models';

@Injectable({
  providedIn: 'root'
})
export class AppInitializationService {
  private serverConfig?: Observable<FrontendSetupResponse>

  // Note: This service should depend on as few services as possible as it is used early in the bootstrap process
  constructor(
    private readonly apiService: ApiService,
    private readonly localStorageService: LocalStorageService,
  ) { }

  public async initialize(): Promise<void> {
    const userSelectedLanguage = this.getSelectedLanguage()

    this.serverConfig = this.apiService.getFrontendSetup({
      frontend_strings: true,
      "accept-language": userSelectedLanguage,
    }).pipe(
      shareReplay(),
    )

    await firstValueFrom(this.serverConfig)
}

  private getSelectedLanguage(): string | undefined {
    return this.localStorageService.getString("language") || undefined
  }
}
