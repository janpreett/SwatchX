import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { SignupPage } from '../../pages/SignupPage'

// Mock the useAuth hook
const mockSignup = vi.fn()
const mockUseAuth = {
  signup: mockSignup,
  login: vi.fn(),
  logout: vi.fn(),
  user: null,
  isLoading: false,
}

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  }
})

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders signup form elements', () => {
    render(<SignupPage />)

    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByText(/agree to.*terms/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('displays validation errors for invalid email', async () => {
    render(<SignupPage />)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('displays validation errors for weak password', async () => {
    render(<SignupPage />)

    const passwordInput = screen.getByLabelText(/^password/i)
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    fireEvent.blur(passwordInput)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('displays error when passwords do not match', async () => {
    render(<SignupPage />)

    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } })
    fireEvent.blur(confirmPasswordInput)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('displays error when terms are not accepted', async () => {
    render(<SignupPage />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Fill form but don't check terms
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/^password/i), { 
      target: { value: 'SecurePass123!' } 
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { 
      target: { value: 'SecurePass123!' } 
    })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/you must agree to the terms/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    mockSignup.mockResolvedValue(undefined)
    render(<SignupPage />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/^password/i), { 
      target: { value: 'SecurePass123!' } 
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { 
      target: { value: 'SecurePass123!' } 
    })
    
    // Check the terms checkbox
    const termsCheckbox = screen.getByRole('checkbox')
    fireEvent.click(termsCheckbox)

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith(
        'test@example.com',
        'SecurePass123!',
        'SecurePass123!'
      )
    })
  })

  it('displays error message when signup fails', async () => {
    const errorMessage = 'Email already registered'
    mockSignup.mockRejectedValue(new Error(errorMessage))
    render(<SignupPage />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'existing@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/^password/i), { 
      target: { value: 'SecurePass123!' } 
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { 
      target: { value: 'SecurePass123!' } 
    })
    fireEvent.click(screen.getByRole('checkbox'))

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('shows success message and redirects after successful signup', async () => {
    mockSignup.mockResolvedValue(undefined)
    render(<SignupPage />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'newuser@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/^password/i), { 
      target: { value: 'SecurePass123!' } 
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { 
      target: { value: 'SecurePass123!' } 
    })
    fireEvent.click(screen.getByRole('checkbox'))

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument()
    })

    // Check that navigation happens after timeout
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    }, { timeout: 2500 })
  })

  it('disables submit button while loading', async () => {
    // Mock loading state
    mockUseAuth.isLoading = true
    mockSignup.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<SignupPage />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    expect(submitButton).toBeDisabled()
  })

  it('has proper accessibility attributes', () => {
    render(<SignupPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('required')
  })

  it('displays link to login page', () => {
    render(<SignupPage />)

    const loginLink = screen.getByText(/already have an account/i)
      .closest('div')
      ?.querySelector('a[href="/login"]')
    
    expect(loginLink).toBeInTheDocument()
  })
})
