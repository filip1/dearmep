import { Injectable } from '@angular/core';

/**
 * Simple wrapper service for the LocalStorage-API.
 * The main purpose of this service is to allow mocking the LocalStorage API during testing.
 * In addition it allows prefixing storage-keys this should help avoid conflicts with the 
 * embedding site (example: use key "dmep-language" instead of "language")
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly keyPrefix = "dmep"

  constructor() { }

  public setString(key: string, value?: string | undefined) {
    const prefixedKey = this.prefixKey(key)
    if (value === null || value === undefined) {
      localStorage.removeItem(prefixedKey)
      return
    }
    localStorage.setItem(prefixedKey, value)
  }

  public getString(key: string): string | null {
    const prefixedKey = this.prefixKey(key)
    return localStorage.getItem(prefixedKey)
  }

  private prefixKey(key: string): string {
    return `${this.keyPrefix}-${key}`
  }
}
