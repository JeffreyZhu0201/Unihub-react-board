

// api/auth.ts

// --- API Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8080/api/v1';

// --- Interfaces ---

/**
 * Standard API Response structure.
 * Adjust generic type T based on specific response data.
 */
export interface ApiResponse<T = any> {
  token : string
}

/**
 * Data returned upon successful authentication.
 */
export interface AuthData {
  token: string;
  user: {
    id: number;
    uuid: string;
    username: string;
    name: string;
    role_id: number;
  };
}

/**
 * Payload for the Login endpoint.
 */
export interface LoginPayload {
  // Corresponds to student_id for students, employee_id for teachers/counselors
  email: string;
  password: string;
}

/**
 * Payload for the Register endpoint.
 */
export interface RegisterPayload {
  // Corresponds to student_id for students, employee_id for teachers/counselors
  email: string; 
  password: string;
  name: string;
  nickname?: string;
  /**
   * Role ID mapping (example):
   * 1: Counselor (Admin-like features for departments)
   * 2: Teacher
   * 3: Student
   */
  role_id: number; 
}

// --- API Functions ---

/**
 * Log in a user.
 * @param payload Login credentials
 */
export async function login(payload: LoginPayload): Promise<ApiResponse<AuthData>> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }
  // console.log("response.token",response?.data);
  return response.json();
}

/**
 * Register a new user.
 * @param payload Registration details including role and ID
 */
export async function register(payload: RegisterPayload): Promise<ApiResponse<AuthData>> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Registration failed: ${response.statusText}`);
  }

  return response.json();
}
