// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MEPDetailComponent } from './mep-detail.component';

describe('MEPDetailComponent', () => {
  let component: MEPDetailComponent;
  let fixture: ComponentFixture<MEPDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MEPDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MEPDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
