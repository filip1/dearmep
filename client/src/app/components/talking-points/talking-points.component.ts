import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'dmep-talking-points',
    templateUrl: './talking-points.component.html',
    styleUrls: ['./talking-points.component.scss'],
    standalone: true,
    imports: [TranslocoModule]
})
export class TalkingPointsComponent {

}
