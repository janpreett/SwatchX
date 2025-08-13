// ***********************************************
// Custom commands for Cypress tests
// ***********************************************

// Command to login a user
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-submit-button"]').click()
})

// Command to signup a user
Cypress.Commands.add('signup', (email: string, password: string) => {
  cy.visit('/signup')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="confirm-password-input"]').type(password)
  cy.get('[data-testid="terms-checkbox"]').check()
  cy.get('[data-testid="signup-submit-button"]').click()
})

// Command to check accessibility
Cypress.Commands.add('checkA11y', (context?: string, options?: any) => {
  cy.injectAxe()
  cy.checkA11y(context, options)
})

// Command to wait for the page to load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="main-content"]', { timeout: 10000 }).should('be.visible')
})

// Command to clear localStorage
Cypress.Commands.add('clearStorage', () => {
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Custom type definitions
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      signup(email: string, password: string): Chainable<void>
      checkA11y(context?: string, options?: any): Chainable<void>
      waitForPageLoad(): Chainable<void>
      clearStorage(): Chainable<void>
    }
  }
}
