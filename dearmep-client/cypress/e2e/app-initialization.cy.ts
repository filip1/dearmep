describe('App initializes correctly', () => {
  // very crude first test to be refined later
  it('Opens the app', () => {
    cy.visit('/')
    cy.contains('Call your MEP now!')
    cy.contains('Call Now Free of charge')
    cy.contains('Daniel FREUND')
  })  
})
