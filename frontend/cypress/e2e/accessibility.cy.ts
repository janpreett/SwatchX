describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.clearStorage()
  })

  it('should have no accessibility violations on signup page', () => {
    cy.visit('/signup')
    cy.injectAxe()
    cy.checkA11y()
  })

  it('should have no accessibility violations on login page', () => {
    cy.visit('/login')
    cy.injectAxe()
    cy.checkA11y()
  })

  it('should have no accessibility violations on home page (authenticated)', () => {
    cy.login('test@example.com', 'password123')
    cy.visit('/home')
    cy.injectAxe()
    cy.checkA11y()
  })

  it('should have proper focus management on signup form', () => {
    cy.visit('/signup')
    
    // Tab through form elements
    cy.get('body').tab()
    cy.focused().should('have.attr', 'data-testid', 'email-input')
    
    cy.focused().tab()
    cy.focused().should('have.attr', 'data-testid', 'password-input')
    
    cy.focused().tab()
    cy.focused().should('have.attr', 'data-testid', 'confirm-password-input')
    
    cy.focused().tab()
    cy.focused().should('have.attr', 'data-testid', 'terms-checkbox')
    
    cy.focused().tab()
    cy.focused().should('have.attr', 'data-testid', 'signup-submit-button')
  })

  it('should have proper ARIA labels and descriptions', () => {
    cy.visit('/signup')
    
    // Check form has proper labeling
    cy.get('[data-testid="email-input"]').should('have.attr', 'aria-label')
    cy.get('[data-testid="password-input"]').should('have.attr', 'aria-label')
    cy.get('[data-testid="confirm-password-input"]').should('have.attr', 'aria-label')
    
    // Check error messages are properly associated
    cy.get('[data-testid="signup-submit-button"]').click() // Trigger validation errors
    
    cy.get('[data-testid="email-error"]').should('have.attr', 'role', 'alert')
    cy.get('[data-testid="password-error"]').should('have.attr', 'role', 'alert')
  })

  it('should support keyboard navigation', () => {
    cy.visit('/login')
    
    // Should be able to navigate and submit using only keyboard
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="email-input"]').tab()
    
    cy.focused().type('password123')
    cy.focused().tab()
    
    cy.focused().should('have.attr', 'data-testid', 'login-submit-button')
    cy.focused().type('{enter}')
    
    // Should submit form
    cy.url().should('include', '/home')
  })
})
