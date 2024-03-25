import { Component } from '@angular/core';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
    selector: 'dmep-title',
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.scss'],
    standalone: true,
    imports: [TranslocoModule]
})
export class TitleComponent {

}
