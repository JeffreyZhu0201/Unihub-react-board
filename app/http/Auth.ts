// api/auth.ts

// --- API Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8080/api/v1';

export interface ApiResponse<T = any> {
  token? : string
  // backend sometimes returns explicit data or just the object
  [key: string]: any;
}

export interface AuthData {
  token: string;
}

/**
 * Payload for the Login endpoint.
 * Matches internal/service/authService.go -> LoginRequest
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Payload for the Register endpoint.
 * Matches internal/service/authService.go -> RegisterRequest
 */
export interface RegisterPayload {
  nickname: string;
  email: string;
  password: string;
  role_key: "student" | "counselor" | "teacher";
  student_no?: string; // Optional, for students
  staff_no?: string;   // Optional, for teachers/counselors
  invite_code?: string;
}

/**
 * Log in a user.
 */
export async function login(payload: LoginPayload): Promise<ApiResponse<AuthData>> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
     const errorData = await response.json();
     throw new Error(errorData.error || "Login failed");
  }
  return response.json();
}

/**
 * Register a new user.
 */
export async function register(payload: RegisterPayload): Promise<ApiResponse<AuthData>> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
     const errorData = await response.json();
    throw new Error(errorData.error || `Registration failed: ${response.statusText}`);
  }

  return response.json();
}

// Stats Interface based on LeaveService.LeaveBackInfo result map
export interface DashboardStats {
  approved: any[];
  returned: any[];
  late_returned: any[];
  leaving: any[];
}

export interface UserRole {
    ID: number;
    Name: string;
    Key: string; // "student", "counselor", "teacher", "admin"
}

export interface UserProfile {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    Nickname: string;
    Email: string;
    Phone?: string;
    RoleID: number;
    Role: UserRole;
    StudentNo?: string;
    StaffNo?: string;
    // Backend might allow lowercase JSON if configured, but Go defaults to Capitalized for Structs
    // We add lowercase aliases for safety if the frontend usage varies
    nickname?: string;
    email?: string;
    role?: UserRole;
    student_no?: string;
    staff_no?: string;
}

// --- Organization & Department Types ---

export interface Department {
    ID: number;
    Name: string;
    InviteCode: string; // 8-char invite code
    CounselorID: number;
    CreatedAt: string;
}

// Reusing UserProfile mostly, but defining a lightweight Student interface for lists
export interface Student {
    ID: number;
    Nickname: string;
    Email: string;
    StudentNo?: string;
    DepartmentID?: number;
    // Allow flexible casing matching backend JSON serialization
    nickname?: string;
    email?: string;
    student_no?: string;
}

export interface DepartmentDetailResponse {
    deptDetails: Department;
    students: Student[];
}

export interface CreateOrgResponse {
    message: string;
    id: number;
    invite_code: string;
}

// --- Class Types ---

export interface Class {
    ID: number;
    Name: string;
    InviteCode: string;
    TeacherID: number;
    CreatedAt: string;
}

export interface ClassDetailResponse {
    classDetails: Class;
    students: Student[];
}

export interface CreateClassResponse {
    message: string;
    id: number;
    invite_code: string;
}

/**
 * Fetch Departments created by the current user (Counselor).
 * Backend route: GET /departments/mine
 */
export async function fetchMyDepartments(token: string): Promise<Department[]> {
    const response = await fetch(`${API_BASE_URL}/departments/mine`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch departments");
    }

    return response.json();
}

/**
 * Create a new department (Counselor).
 * Backend route: POST /departments
 */
export async function createDepartment(token: string, name: string): Promise<CreateOrgResponse> {
    const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create department");
    }

    return response.json();
}

/**
 * Fetch details and students for a specific department.
 * Backend route: GET /departments/mine/:deptId
 */
export async function fetchDepartmentDetail(token: string, deptId: number): Promise<DepartmentDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/departments/mine/${deptId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch department details");
    }

    return response.json();
}

/**
 * Fetch dashboard statistics (Counselor view)
 * Backend route is POST /leaves/leavebackinfo
 */
export async function fetchDashboardStats(token: string): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/leaves/leavebackinfo`, {
    method: 'POST', // IMPORTANT: Backend uses POST for this fetch
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({}) // Empty body usually required for POST
  });

  if (!response.ok) {
     if (response.status === 403) {
         // Return empty if permission denied (e.g. student view)
        return { approved: [], returned: [], late_returned: [], leaving: [] };
     }
     const errorData = await response.json();
     throw new Error(errorData.error || "Failed to fetch stats");
  }

  return response.json();
}

/**
 * Fetch current user profile.
 * Backend route is GET /user/profile
 */
export async function fetchUserProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user profile");
    }

    return response.json();
}

/**
 * Fetch Classes created by the current user (Teacher).
 * Backend route: GET /classes/mine
 */
export async function fetchMyClasses(token: string): Promise<Class[]> {
    const response = await fetch(`${API_BASE_URL}/classes/mine`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch classes");
    }

    return response.json();
}

/**
 * Create a new class (Teacher).
 * Backend route: POST /classes
 */
export async function createClass(token: string, name: string): Promise<CreateClassResponse> {
    const response = await fetch(`${API_BASE_URL}/classes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create class");
    }

    return response.json();
}

/**
 * Fetch details and students for a specific class.
 * Backend route: GET /classes/mine/:classId
 */
export async function fetchClassDetail(token: string, classId: number): Promise<ClassDetailResponse> {
    const response = await fetch(`${API_BASE_URL}/classes/mine/${classId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch class details");
    }

    return response.json();
}
