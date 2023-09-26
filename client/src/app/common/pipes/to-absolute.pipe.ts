import { Pipe, PipeTransform } from '@angular/core';
import { BaseUrlService } from '../services/base-url.service';

@Pipe({
  name: 'toAbsolute'
})
export class ToAbsolutePipe implements PipeTransform {
  constructor(
    private readonly baseUrlService: BaseUrlService,
  ) { }

  transform(url: string | undefined): string | undefined {
    if (!url) {
      return url
    }
    return this.baseUrlService.toAbsoluteUrl(url)
  }
}
