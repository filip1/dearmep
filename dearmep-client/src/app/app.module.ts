import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';
import { ApiModule } from './api/api.module';
import { createCustomElement } from '@angular/elements';

import { MatButtonModule } from '@angular/material/button'
import { CommonModule } from './common/common.module';
import { BaseUrlInterceptor } from './common/interceptors/base-url.interceptor';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoRootModule,
    ApiModule.forRoot({ rootUrl: 'http://127.0.0.1:8000' }), // TODO: Make configurable later
    MatButtonModule,
    CommonModule,
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
  }
}
