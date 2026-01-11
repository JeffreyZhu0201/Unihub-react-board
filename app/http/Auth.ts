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

// --- Leave Types ---

/**
 * Matches the map structure returned by GORM query in ListPendingLeaves
 * Keys are snake_case from database columns
 */
export interface LeaveRequest {
    id: number;
    created_at: string;
    updated_at: string;
    student_id: number;
    student_name: string; // From joined query 'users.nickname as student_name'
    type: string;
    start_time: string;
    end_time: string;
    reason: string;
    status: string; // "pending", "approved", "rejected"
}

export interface AuditLeavePayload {
    leave_id: number;
    status: "approved" | "rejected";
}

/**
 * Fetch pending leaves for the current counselor.
 * Backend route: GET /leaves/pending
 */
export async function fetchPendingLeaves(token: string): Promise<LeaveRequest[]> {
    const response = await fetch(`${API_BASE_URL}/leaves/pending`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        // Backend might return empty list as null or 404 in some legacy setups, 
        // but normally 200 OK with empty array.
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            throw new Error(json.error || "Failed to fetch pending leaves");
        } catch (e) {
            throw new Error(`Failed to fetch pending leaves: ${text}`);
        }
    }

    return response.json();
}

/**
 * Audit a leave request (Approve/Reject).
 * Backend route: POST /leaves/audit
 */
export async function auditLeave(token: string, payload: AuditLeavePayload): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/leaves/audit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to audit leave");
    }
}

// --- Ding (Check-in) Types ---

export interface DingTask {
    ID: number;
    CreatedAt: string;
    Title: string;
    description?: string; // Note: Model might stick to Title/Type, check strict definitions
    StartTime: string;
    Deadline: string;
    Type: string; // "sign_in" | "dorm_check" etc.
}

export interface DingRecord {
    id: number;
    student_id: number;
    student_name: string;
    student_no: string;
    status: "pending" | "complete" | "late";
    ding_time?: string;
    photo_url?: string;
    location?: string;
}

export interface DingListResponse {
    dings: DingTask[];
}

// 对应后端 internal/DTO/dingDTO.go 中的 CreateDingRequest
export interface CreateDingPayload {
    title: string;
    start_time: string; // RFC3339 格式: 2024-01-01T12:00:00Z
    end_time: string;   
    latitude: number;   // 必填
    longitude: number;  // 必填
    radius: number;     // 必填
    type: string;       // 必填
    
    // 后端通过判断哪个字段不为 0 来决定发送范围
    dept_id?: number;   
    class_id?: number;
    student_id?: number;
}

export interface DingRecordsResponse {
    records: DingRecord[];
}

/**
 * Create a new Ding task (Check-in).
 * Backend route: POST /dings/createdings
 */
export async function createDing(token: string, payload: CreateDingPayload): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/dings/createdings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "发布打卡任务失败");
    }
}

/**
 * Fetch dings created by the current user (Counselor/Teacher).
 * Backend route: GET /dings/mycreateddings
 */
export async function fetchMyCreatedDings(token: string): Promise<DingTask[]> {
    const response = await fetch(`${API_BASE_URL}/dings/mycreateddings`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch created dings");
    }

    const data: DingListResponse = await response.json();
    return data.dings || [];
}

/**
 * Fetch records (student status) for a specific ding.
 * Backend route: GET /dings/mycreateddingsrecords/:dingId
 */
export async function fetchDingRecords(token: string, dingId: number): Promise<DingRecord[]> {
    const response = await fetch(`${API_BASE_URL}/dings/mycreateddingsrecords/${dingId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch ding records");
    }

    const data: DingRecordsResponse = await response.json();
    return data.records || [];
}

export interface DingStats {
    total_count: number;
    checked_count: number;
    missed_count: number;
}

/**
 * Fetch aggregated statistics for created dings.
 * Backend route: GET /dings/stats
 */
export async function fetchDingStats(token: string): Promise<DingStats> {
    const response = await fetch(`${API_BASE_URL}/dings/stats`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        console.warn("Failed to fetch ding stats");
        // 返回0防止页面崩溃
        return { total_count: 0, checked_count: 0, missed_count: 0 };
    }

    return response.json();
}

// --- Notification Types ---

export interface CreateNotificationPayload {
    title: string;
    content: string;
    target_type: "dept" | "class";
    target_id: number;
}

/**
 * Create a new Notification.
 * Backend route: POST /notifications
 */
export async function createNotification(token: string, payload: CreateNotificationPayload): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "发布通知失败");
    }
}
