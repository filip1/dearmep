import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

(async () => {
  const app = await createApplication(appConfig);
  const appComponent = createCustomElement(AppComponent, {
    injector: app.injector,
  });
  customElements.define(environment.dmepTagName, appComponent);
})().catch((err) => console.error(err));
