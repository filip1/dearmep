import { DoBootstrap, Injector, NgModule } from '@angular/core';
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
import { LayoutModule } from './layout/layout.module';
import { CallingModule } from './calling/calling.module';
import { Router } from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoRootModule,
    ApiModule.forRoot({ rootUrl: '/' }),
    AppCommonModule,
    ComponentsModule,
    LayoutModule,
    CallingModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BaseUrlInterceptor, multi: true },
  ],
  bootstrap: [],
})
export class AppModule implements DoBootstrap {
  constructor(private readonly injector: Injector) {}

  ngDoBootstrap() {
    const app = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('dear-mep', app);
    const router = this.injector.get(Router)
    router.initialNavigation()
  }
}
