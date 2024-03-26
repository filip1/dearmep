import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DestinationRead } from 'src/app/api/models';
import { ToAbsolutePipe } from '../../common/pipes/to-absolute.pipe';
import { SocialIconComponent } from '../social-icon/social-icon.component';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'dmep-mep-detail',
  templateUrl: './mep-detail.component.html',
  styleUrls: ['./mep-detail.component.scss'],
  standalone: true,
  imports: [
    MatProgressSpinner,
    MatIconButton,
    MatIcon,
    SocialIconComponent,
    ToAbsolutePipe,
  ],
})
export class MEPDetailComponent {
  public imageLoadedUrl?: string;

  @Input()
  public allowChangeMEP?: boolean | null;

  @Input()
  public mep?: DestinationRead | null;

  @Output()
  public MEPChange = new EventEmitter<void>();

  public MEPChangeClick() {
    this.MEPChange.emit();
  }

  public imageLoaded(): boolean {
    return !!this.mep?.portrait && this.mep.portrait === this.imageLoadedUrl;
  }
}
