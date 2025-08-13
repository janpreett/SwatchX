describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearStorage()
  })

  describe('Signup Flow', () => {
    it('should successfully sign up a new user', () => {
      const email = `test${Date.now()}@example.com`
      const password = 'SecurePass123!'

      cy.visit('/signup')
      
      // Wait for page to load
      cy.get('[data-testid="signup-form"]').should('be.visible')
      
      // Fill out form
      cy.get('[data-testid="email-input"]').type(email)
      cy.get('[data-testid="password-input"]').type(password)
      cy.get('[data-testid="confirm-password-input"]').type(password)
      cy.get('[data-testid="terms-checkbox"]').check()
      
      // Submit form
      cy.get('[data-testid="signup-submit-button"]').click()
      
      // Should show success message
      cy.get('[data-testid="success-message"]').should('contain', 'Account created successfully')
      
      // Should redirect to login
      cy.url().should('include', '/login')
    })

    it('should show validation errors for invalid data', () => {
      cy.visit('/signup')
      
      // Try to submit empty form
      cy.get('[data-testid="signup-submit-button"]').click()
      
      // Should show validation errors
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
      cy.get('[data-testid="terms-error"]').should('contain', 'You must agree to the terms')
    })

    it('should validate email format', () => {
      cy.visit('/signup')
      
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="email-input"]').blur()
      
      cy.get('[data-testid="email-error"]').should('contain', 'Please enter a valid email address')
    })

    it('should validate password requirements', () => {
      cy.visit('/signup')
      
      cy.get('[data-testid="password-input"]').type('weak')
      cy.get('[data-testid="password-input"]').blur()
      
      cy.get('[data-testid="password-error"]').should('contain', 'Password must be at least 8 characters')
    })

    it('should validate password confirmation', () => {
      cy.visit('/signup')
      
      cy.get('[data-testid="password-input"]').type('SecurePass123!')
      cy.get('[data-testid="confirm-password-input"]').type('DifferentPass123!')
      cy.get('[data-testid="confirm-password-input"]').blur()
      
      cy.get('[data-testid="confirm-password-error"]').should('contain', 'Passwords do not match')
    })

    it('should handle duplicate email error', () => {
      cy.visit('/signup')
      
      // Use a known existing email
      cy.get('[data-testid="email-input"]').type('existing@example.com')
      cy.get('[data-testid="password-input"]').type('SecurePass123!')
      cy.get('[data-testid="confirm-password-input"]').type('SecurePass123!')
      cy.get('[data-testid="terms-checkbox"]').check()
      
      cy.get('[data-testid="signup-submit-button"]').click()
      
      cy.get('[data-testid="error-message"]').should('contain', 'Email already registered')
    })
  })

  describe('Login Flow', () => {
    it('should successfully log in a user', () => {
      cy.visit('/login')
      
      // Fill out form
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      
      // Submit form
      cy.get('[data-testid="login-submit-button"]').click()
      
      // Should redirect to home
      cy.url().should('include', '/home')
      
      // Should show user info
      cy.get('[data-testid="user-welcome"]').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="email-input"]').type('invalid@example.com')
      cy.get('[data-testid="password-input"]').type('wrongpassword')
      
      cy.get('[data-testid="login-submit-button"]').click()
      
      cy.get('[data-testid="error-message"]').should('contain', 'Incorrect email or password')
    })

    it('should validate required fields', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="login-submit-button"]').click()
      
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
    })
  })

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.visit('/home')
      
      // Should be redirected to login
      cy.url().should('include', '/login')
    })

    it('should allow authenticated users to access protected routes', () => {
      // Log in first
      cy.login('test@example.com', 'password123')
      
      // Should be on home page
      cy.url().should('include', '/home')
      
      // Should show protected content
      cy.get('[data-testid="protected-content"]').should('be.visible')
    })
  })

  describe('Logout Flow', () => {
    it('should successfully log out a user', () => {
      // Log in first
      cy.login('test@example.com', 'password123')
      
      // Logout
      cy.get('[data-testid="logout-button"]').click()
      
      // Should redirect to login
      cy.url().should('include', '/login')
      
      // Should clear user data
      cy.window().its('localStorage').should('not.contain.key', 'auth_token')
    })
  })

  describe('Token Management', () => {
    it('should store token after successful login', () => {
      cy.login('test@example.com', 'password123')
      
      cy.window().its('localStorage').should('contain.key', 'auth_token')
    })

    it('should handle expired tokens', () => {
      // Set an expired token
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'expired_token')
      })
      
      cy.visit('/home')
      
      // Should redirect to login due to expired token
      cy.url().should('include', '/login')
    })
  })
})
