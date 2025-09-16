// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';
import { SafePipe } from 'src/app/common/pipes/safe.pipe';

@Component({
  selector: 'dmep-talking-points',
  templateUrl: './talking-points.component.html',
  styleUrls: ['./talking-points.component.scss'],
  imports: [TranslocoModule, SafePipe],
})
export class TalkingPointsComponent {}
