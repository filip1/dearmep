import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DestinationRead } from 'src/app/api/models';
import { CallingStep } from 'src/app/model/calling-step.enum';
import { CallingStateManagerService } from 'src/app/services/calling/calling-state-manager.service';
import { SelectDestinationService } from 'src/app/services/select-destination/select-destination.service';

@Component({
  selector: 'dmep-select-mep',
  templateUrl: './select-mep.component.html',
  styleUrls: ['./select-mep.component.scss']
})
export class SelectMEPComponent implements OnInit {
  public mepSelectionPossible$?: Observable<boolean>

  public selectedMEP$?: Observable<DestinationRead | undefined>

  constructor(
    private readonly callingStepManagerService: CallingStateManagerService,
    private readonly selectDestinationService: SelectDestinationService,
  ) { }

  public ngOnInit(): void {
    this.mepSelectionPossible$ = this.callingStepManagerService.getStep$().pipe(
      map(step => step !== CallingStep.Setup && step !== CallingStep.Feedback && step !== CallingStep.UpdateCallSchedule)
    )

    this.selectedMEP$ = this.selectDestinationService.getDestination$()
  }

  public renewSuggestion() {
    this.selectDestinationService.renewSuggestedDestination()
  }
}
