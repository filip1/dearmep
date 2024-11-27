// SPDX-FileCopyrightText: © 2023 Tobias Mühlberger
//
// SPDX-License-Identifier: AGPL-3.0-or-later

describe('App initializes correctly', () => {
  // very crude first test to be refined later
  it('Opens the app', () => {
    cy.visit('/');
    cy.contains('Call your MEP now!');
    cy.contains('Call Now Free of charge');
    cy.contains('Daniel FREUND');
  });
});
