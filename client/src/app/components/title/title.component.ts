// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'dmep-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
  imports: [TranslocoModule],
})
export class TitleComponent {}
