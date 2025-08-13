import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { LoginPage } from '../../pages/LoginPage'

// Mock the useAuth hook
const mockLogin = vi.fn()
const mockUseAuth = {
  login: mockLogin,
  signup: vi.fn(),
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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form elements', () => {
    render(<LoginPage />)

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('displays validation error for invalid email format', async () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('displays validation error for empty password', async () => {
    render(<LoginPage />)

    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: '' } })
    fireEvent.blur(passwordInput)

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginPage />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('displays error message when login fails', async () => {
    const errorMessage = 'Incorrect email or password'
    mockLogin.mockRejectedValue(new Error(errorMessage))
    render(<LoginPage />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'invalid@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'wrongpassword' } 
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('redirects to home page after successful login', async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginPage />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'user@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home')
    })
  })

  it('disables submit button while loading', async () => {
    mockUseAuth.isLoading = true
    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    expect(submitButton).toBeDisabled()
  })

  it('shows loading state on submit button', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<LoginPage />)

    // Fill form and submit
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes', () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
  })

  it('displays link to signup page', () => {
    render(<LoginPage />)

    const signupLink = screen.getByText(/don't have an account/i)
      .closest('div')
      ?.querySelector('a[href="/signup"]')
    
    expect(signupLink).toBeInTheDocument()
  })

  it('allows password visibility toggle', () => {
    render(<LoginPage />)

    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle to show password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click toggle to hide password again
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('focuses on email input on component mount', () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveFocus()
  })
})
