import { http, HttpResponse } from 'msw'

export const authHandlers = [
  // Mock signup endpoint
  http.post('/auth/signup', async ({ request }) => {
    const body = await request.json() as {
      email: string
      password: string
      confirm_password: string
    }

    // Simulate validation errors
    if (!body.email || !body.email.includes('@')) {
      return new HttpResponse(
        JSON.stringify({ detail: 'Invalid email format' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!body.password || body.password.length < 8) {
      return new HttpResponse(
        JSON.stringify({ detail: 'Password must be at least 8 characters' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (body.password !== body.confirm_password) {
      return new HttpResponse(
        JSON.stringify({ detail: 'Passwords do not match' }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Simulate duplicate email
    if (body.email === 'existing@example.com') {
      return new HttpResponse(
        JSON.stringify({ detail: 'Email already registered' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Success response
    return HttpResponse.json({
      access_token: 'mock_jwt_token_signup',
      token_type: 'bearer',
      user: {
        id: 1,
        email: body.email,
        is_active: true,
        created_at: new Date().toISOString()
      }
    }, { status: 201 })
  }),

  // Mock login endpoint
  http.post('/auth/login', async ({ request }) => {
    const formData = await request.formData()
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    // Simulate invalid credentials
    if (username === 'invalid@example.com' || password === 'wrongpassword') {
      return new HttpResponse(
        JSON.stringify({ detail: 'Incorrect email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Success response
    return HttpResponse.json({
      access_token: 'mock_jwt_token_login',
      token_type: 'bearer',
      user: {
        id: 1,
        email: username,
        is_active: true,
        created_at: '2024-01-01T00:00:00.000Z'
      }
    })
  }),

  // Mock protected endpoint
  http.get('/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ detail: 'Could not validate credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    if (!token || token === 'invalid_token') {
      return new HttpResponse(
        JSON.stringify({ detail: 'Could not validate credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return HttpResponse.json({
      id: 1,
      email: 'testuser@example.com',
      is_active: true,
      created_at: '2024-01-01T00:00:00.000Z'
    })
  }),

  // Mock health endpoint
  http.get('/health', () => {
    return HttpResponse.json({ status: 'healthy' })
  }),
]

export const handlers = [...authHandlers]
