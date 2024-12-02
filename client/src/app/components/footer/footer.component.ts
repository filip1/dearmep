// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'dmep-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [TranslocoModule],
})
export class FooterComponent {}
