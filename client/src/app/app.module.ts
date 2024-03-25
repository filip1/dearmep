import { APP_INITIALIZER, DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';
import { ApiModule } from './api/api.module';
import { createCustomElement } from '@angular/elements';

import { AppCommonModule } from './common/app-common.module';
import { BaseUrlInterceptor } from './common/interceptors/base-url.interceptor';
import { ComponentsModule } from './components/components.module';
import { CallingModule } from './calling/calling.module';
import { RetryInterceptor } from './common/interceptors/retry.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { AuthInterceptor } from './common/interceptors/auth.interceptor';
import { ConfigService } from './services/config/config.service';
import { BaseUrlService } from './common/services/base-url.service';
import { UrlUtil } from './common/util/url.util';

const dmepTagName = "dear-mep"

// It is required to set the api-url before the app is initialized
// otherwise the APP_INITIALIZER will be stuck trying to make a request
// this solves the chicken and egg problem.
function setApiUrl(baseUrlService: BaseUrlService) {
  const elements = document.getElementsByTagName(dmepTagName)
  if (!elements || elements.length === 0) {
    throw Error(`<${dmepTagName}></${dmepTagName}> element not found`)
  }
  const hostAttr = elements[0].getAttribute("host")
  const apiAttr = elements[0].getAttribute("api") || "/"
  if (!hostAttr) {
    throw Error(`<${dmepTagName}></${dmepTagName}> is missing "host" attribute`)
  }
  const apiUrl = UrlUtil.toAbsolute(apiAttr, hostAttr)
  baseUrlService.setAPIUrl(apiUrl)
}

function appInitializerFactory(configService: ConfigService, baseUrlService: BaseUrlService): () => Promise<void> {
  return async() => {
    setApiUrl(baseUrlService)
    await configService.initialize()
  }
}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        TranslocoRootModule,
        ApiModule.forRoot({ rootUrl: '' }),
        AppCommonModule,
        ComponentsModule,
        CallingModule,
        AppComponent,
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },
        { provide: APP_INITIALIZER, useFactory: appInitializerFactory, deps: [ConfigService, BaseUrlService], multi: true }
    ],
    bootstrap: [],
})
export class AppModule implements DoBootstrap {
  constructor(private readonly injector: Injector) {}

  ngDoBootstrap() {
    const app = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define(dmepTagName, app);
  }
}


