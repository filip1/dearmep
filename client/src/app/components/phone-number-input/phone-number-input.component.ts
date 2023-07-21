import { FocusMonitor } from '@angular/cdk/a11y';
import { Component, ElementRef, HostBinding, Inject, Input, OnDestroy, OnInit, Optional, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, NgControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatFormField, MatFormFieldControl, MAT_FORM_FIELD } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { TranslocoService } from '@ngneat/transloco';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { PhoneNumber } from 'src/app/model/phone-number.model';
import { AppConfig } from 'src/app/services/config/app-config.model';
import { ConfigService } from 'src/app/services/config/config.service';
import { L10nService } from 'src/app/services/l10n/l10n.service';

interface Country {
  name: string
  countryCode: string
  callingCode: string
}

/**
 * Custom component to input phone number with international calling code.
 *
 * This is a very pragmatic implementation of a MatFormFieldControl. It gets the job
 * done but does not implement the complete functionality of a FormControl.
 */
@Component({
  selector: 'dmep-phone-number-input',
  templateUrl: './phone-number-input.component.html',
  styleUrls: ['./phone-number-input.component.css'],
  providers: [{ provide: MatFormFieldControl, useExisting: PhoneNumberInputComponent }]
})
export class PhoneNumberInputComponent implements ControlValueAccessor, MatFormFieldControl<PhoneNumber>, OnInit, OnDestroy {
  static nextId = 0;

  private readonly destroyed$ = new Subject<void>()

  @ViewChild('countrySelect')
  public countrySelect?: MatSelect;
  @ViewChild('numberInput')
  public numberInput?: HTMLInputElement;
  @ViewChild("formField")
  public formField?: MatFormField

  public readonly controlType = 'phone-number-input';
  public readonly stateChanges = new Subject<void>();

  @HostBinding()
  public readonly id = `${this.controlType}-${PhoneNumberInputComponent.nextId++}`;

  public shouldLabelFloat = true;
  public ariaDescribedBy?: string
  public touched = false;
  public focused = false;
  public required = false;
  public disabled = false;
  public autofilled?: boolean;
  public userAriaDescribedBy?: string;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onTouched = () => { };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public onChange = (_: PhoneNumber | null | undefined) => { };

  private readonly numberValidator: ValidatorFn = (control): ValidationErrors | null => {
    if (control.value?.length > 0) {
      return null
    }
    return { numberError: "invalid-number" }
  }

  public _countries?: Country[]
  public _numberFormGroup = this.formBuilder.group({
    country: new FormControl<Country | null>(null),
    number: new FormControl<string | null>(null, { validators: this.numberValidator }),
  }, {
    updateOn: "change",
  })

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder = "";

  private defaultCountry?: string

  @Input()
  public get value(): PhoneNumber | null {
    if (this._numberFormGroup.valid && this._numberFormGroup.value.country && this._numberFormGroup.value.number) {
      const {
        value: { country, number },
      } = this._numberFormGroup;
      return { callingCode: country?.callingCode, number: number };
    }
    return null;
  }
  public set value(tel: PhoneNumber | null) {
    const callingCode = tel?.callingCode || null
    const numer = tel?.number || null
    const country: Country | undefined = this._countries ? this._countries.find(c => c.callingCode === callingCode) : ({ callingCode: callingCode } as Country)
    this._numberFormGroup.controls.country.setValue(country || null)
    this._numberFormGroup.controls.number.setValue(numer)
    this.stateChanges.next();
  }

  constructor(
    private readonly translocoService: TranslocoService,
    private formBuilder: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    private readonly configService: ConfigService,
    private readonly l10nService: L10nService,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  public ngOnInit(): void {
    this._numberFormGroup.valueChanges.subscribe({
      next: () => {
        this.onChange(this.value)
        this.stateChanges.next()
      }
    })

    combineLatest([
      this.translocoService.langChanges$,
      this.configService.getConfig$(),
    ]).subscribe({
      next: ([_, config]) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        this._countries = this.getCountries(config)
        const selectedCountry = this._numberFormGroup.value.country || undefined
        const newCountry = this._countries.find(c => this.compareCountry(c, selectedCountry))
        if (selectedCountry && newCountry && selectedCountry !== newCountry) {
          this._numberFormGroup.controls.country.setValue(newCountry, { emitEvent: false })
        }
      }
    })

    this.l10nService.getCountry$().pipe(
      takeUntil(this.destroyed$)
    ).subscribe({
      next: (country) => {
        this.defaultCountry = country

        const numberControl = this._numberFormGroup.controls.number
        if (!numberControl.value || numberControl.value === '') {
          const countryObj = this._countries?.find(c => c.countryCode === country)
          if (countryObj) {
            this._numberFormGroup.controls.country.setValue(countryObj, { emitEvent: false })
          }
        }
      }
    })
  }

  public onFocusIn() {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  public onFocusOut(event: FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  public ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
    this.destroyed$.next()
    this.destroyed$.complete()
  }

  public compareCountry(a?: Country, b?: Country): boolean {
    return a?.callingCode === b?.callingCode
  }

  get errorState(): boolean {
    return this._numberFormGroup.invalid && this.touched;
  }

  get empty() {
    const {
      value: { country, number },
    } = this._numberFormGroup;
    return !country && !number;
  }

  public setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef?.nativeElement?.querySelector('.dmep-phone-number-input-container');
    controlElement?.setAttribute('aria-describedby', ids.join(' '));
  }

  public writeValue(tel: PhoneNumber | null): void {
    this.value = tel;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerOnChange(fn: (_:any)=>void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onContainerClick(): void {
  }

  private getCountries(config: AppConfig): Country[] {
    const countries: Country[] = []
    for (const countryCode of Object.keys(config.availableCallingCodes)) {
      const country: Country = {
        countryCode,
        callingCode: config.availableCallingCodes[countryCode],
        name: this.translocoService.translate(`countries.${countryCode}`)
      }
      countries.push(country)
    }
    countries.sort((a, b) => a.name.localeCompare(b.name))
    return countries
  }
}
