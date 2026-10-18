import { createClient } from '@supabase/supabase-js';
import { EvaluationResult, TeacherAccount, StudentAccount } from '../types';

export const SUPABASE_URL = 'https://atnoxsootruzjgenxpof.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bm94c29vdHJ1empnZW54cG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1OTM2MTUsImV4cCI6MjEwMjE2OTYxNX0.lteNWRN9AUdzJAsB7vdf8SMP1KPCMpzgU21eOJeQNg8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// No prefilled teachers - only teachers actually registered in the app will appear
export const DEFAULT_TEACHERS: TeacherAccount[] = [];

const LEGACY_PREFILLED_TEACHER_IDS = new Set([
  'teacher_shirlene',
  'teacher_roberto',
  'teacher_maria'
]);

export async function fetchRegisteredTeachers(): Promise<TeacherAccount[]> {
  let teachers: TeacherAccount[] = [];

  // 1. Read from localStorage cache (filtering out any legacy prefilled teachers)
  try {
    const local = localStorage.getItem('depedqc_registered_teachers');
    if (local) {
      const parsed: TeacherAccount[] = JSON.parse(local);
      const filtered = parsed.filter(t => !LEGACY_PREFILLED_TEACHER_IDS.has(t.id));
      if (filtered.length !== parsed.length) {
        localStorage.setItem('depedqc_registered_teachers', JSON.stringify(filtered));
      }
      for (const t of filtered) {
        if (!teachers.some(existing => existing.email.toLowerCase() === t.email.toLowerCase())) {
          teachers.push(t);
        }
      }
    }
  } catch (e) {
    console.warn('Error reading local teachers:', e);
  }

  // 2. Fetch from Supabase teachers table if table exists
  try {
    const { data, error } = await supabase.from('teachers').select('*');
    if (!error && data && data.length > 0) {
      for (const row of data) {
        if (LEGACY_PREFILLED_TEACHER_IDS.has(row.id)) continue;
        const teacherObj: TeacherAccount = {
          id: row.id || `teacher_${Date.now()}`,
          fullName: row.full_name || row.name || 'DepEd QC Teacher',
          email: row.email || '',
          department: row.department || 'ICT / CSS',
          employeeId: row.employee_id || '',
          password: row.password || 'password123',
          createdAt: row.created_at || new Date().toISOString()
        };
        if (teacherObj.email && !teachers.some(t => t.email.toLowerCase() === teacherObj.email.toLowerCase())) {
          teachers.push(teacherObj);
        }
      }
    }
  } catch (err) {
    // Graceful fallback if table does not exist
  }

  return teachers;
}

export async function registerTeacherAccount(teacherData: {
  fullName: string;
  email: string;
  department?: string;
  employeeId?: string;
  password?: string;
}): Promise<{ success: boolean; teacher?: TeacherAccount; error?: string }> {
  const email = teacherData.email.trim().toLowerCase();
  if (!email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  
  // Validate DepEd QC or DepEd domain
  const isDepedQC = email.endsWith('@depedqc.ph') || email.includes('depedqc') || email.includes('deped');
  if (!isDepedQC) {
    return {
      success: false,
      error: 'Teacher registration requires an official DepEd QC email address (@depedqc.ph or DepEd domain).'
    };
  }

  const existingTeachers = await fetchRegisteredTeachers();
  if (existingTeachers.some(t => t.email.toLowerCase() === email)) {
    return {
      success: false,
      error: 'An account with this DepEd QC email address already exists. Please use the Sign In option.'
    };
  }

  const newTeacher: TeacherAccount = {
    id: `teacher_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    fullName: teacherData.fullName.trim(),
    email,
    department: teacherData.department?.trim() || 'Computer Systems Servicing / ICT',
    employeeId: teacherData.employeeId?.trim() || `QC-${Math.floor(10000 + Math.random() * 90000)}`,
    password: teacherData.password || 'password123',
    createdAt: new Date().toISOString()
  };

  // Save to local storage
  try {
    const updated = [...existingTeachers, newTeacher];
    localStorage.setItem('depedqc_registered_teachers', JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save teacher to local storage:', e);
  }

  // Attempt save to Supabase
  try {
    await supabase.from('teachers').insert([{
      id: newTeacher.id,
      full_name: newTeacher.fullName,
      email: newTeacher.email,
      department: newTeacher.department,
      employee_id: newTeacher.employeeId,
      password: newTeacher.password,
      created_at: newTeacher.createdAt
    }]);
  } catch (err) {
    console.warn('Supabase teacher insert attempt:', err);
  }

  return { success: true, teacher: newTeacher };
}

export async function fetchRegisteredStudents(): Promise<StudentAccount[]> {
  let students: StudentAccount[] = [];

  // 1. Read from localStorage cache
  try {
    const local = localStorage.getItem('depedqc_registered_students');
    if (local) {
      const parsed: StudentAccount[] = JSON.parse(local);
      for (const s of parsed) {
        if (s.lrn && !students.some(existing => existing.lrn.toLowerCase() === s.lrn.toLowerCase())) {
          students.push(s);
        }
      }
    }
  } catch (e) {
    console.warn('Error reading local students:', e);
  }

  // 2. Fetch from Supabase student_accounts table if table exists
  try {
    const { data, error } = await supabase.from('student_accounts').select('*');
    if (!error && data && data.length > 0) {
      for (const row of data) {
        const studentObj: StudentAccount = {
          id: row.id || `student_${Date.now()}`,
          lrn: row.lrn || row.student_id || '',
          firstName: row.first_name || '',
          middleInitial: row.middle_initial || '',
          lastName: row.last_name || '',
          name: row.name || row.full_name || 'Student',
          section: row.section || '',
          teacherId: row.teacher_id || '',
          teacherName: row.teacher_name || '',
          teacherEmail: row.teacher_email || '',
          password: row.password || '',
          createdAt: row.created_at || new Date().toISOString()
        };
        if (studentObj.lrn && !students.some(s => s.lrn.toLowerCase() === studentObj.lrn.toLowerCase())) {
          students.push(studentObj);
        }
      }
    }
  } catch (err) {
    // Graceful fallback if table does not exist
  }

  return students;
}

export async function registerStudentAccount(studentData: {
  lrn: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  section: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  password: string;
}): Promise<{ success: boolean; student?: StudentAccount; error?: string }> {
  const lrn = studentData.lrn.trim();
  if (!lrn) {
    return { success: false, error: 'Please enter your LRN Number.' };
  }
  if (!studentData.password.trim()) {
    return { success: false, error: 'Please create a password for your student account.' };
  }

  const existingStudents = await fetchRegisteredStudents();
  if (existingStudents.some(s => s.lrn.toLowerCase() === lrn.toLowerCase())) {
    return {
      success: false,
      error: 'A student account with this LRN Number is already registered. Please use the Sign In option.'
    };
  }

  const mi = (studentData.middleInitial || '').trim()
    ? (studentData.middleInitial || '').trim().endsWith('.')
      ? (studentData.middleInitial || '').trim().toUpperCase()
      : `${(studentData.middleInitial || '').trim().toUpperCase()}.`
    : '';
  const fullName = `${studentData.firstName.trim()} ${mi} ${studentData.lastName.trim()}`.replace(/\s+/g, ' ');

  const newStudent: StudentAccount = {
    id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    lrn,
    firstName: studentData.firstName.trim(),
    middleInitial: mi,
    lastName: studentData.lastName.trim(),
    name: fullName,
    section: studentData.section.trim(),
    teacherId: studentData.teacherId,
    teacherName: studentData.teacherName,
    teacherEmail: studentData.teacherEmail,
    password: studentData.password,
    createdAt: new Date().toISOString()
  };

  // Save to localStorage
  try {
    const updated = [...existingStudents, newStudent];
    localStorage.setItem('depedqc_registered_students', JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save student to local storage:', e);
  }

  // Attempt save to Supabase
  try {
    await supabase.from('student_accounts').insert([{
      id: newStudent.id,
      lrn: newStudent.lrn,
      first_name: newStudent.firstName,
      middle_initial: newStudent.middleInitial,
      last_name: newStudent.lastName,
      name: newStudent.name,
      section: newStudent.section,
      teacher_id: newStudent.teacherId,
      teacher_name: newStudent.teacherName,
      teacher_email: newStudent.teacherEmail,
      password: newStudent.password,
      created_at: newStudent.createdAt
    }]);
  } catch (err) {
    // Graceful fallback
  }

  return { success: true, student: newStudent };
}

export async function loginStudentAccount(
  lrn: string,
  password: string
): Promise<{ success: boolean; student?: StudentAccount; error?: string }> {
  const cleanLrn = lrn.trim();
  if (!cleanLrn) {
    return { success: false, error: 'Please enter your LRN Number.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const students = await fetchRegisteredStudents();
  const found = students.find(s => s.lrn.toLowerCase() === cleanLrn.toLowerCase());
  if (!found) {
    return {
      success: false,
      error: 'No student account found with this LRN Number. Please register your account first.'
    };
  }

  if (found.password !== password) {
    return {
      success: false,
      error: 'Incorrect password. Please check your LRN Number and password.'
    };
  }

  return { success: true, student: found };
}

export const SQL_SETUP_SCRIPT = `-- =========================================================================
-- RUN THIS IN YOUR SUPABASE DASHBOARD -> SQL EDITOR TO FIX DATA INSERTION
-- =========================================================================

-- 1. Create or update student_scores table
CREATE TABLE IF NOT EXISTS public.student_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT,
  full_name TEXT,
  name TEXT,
  section TEXT,
  os_type TEXT,
  task_title TEXT,
  total_earned INT,
  total_max INT,
  percentage INT,
  grade TEXT,
  passed BOOLEAN,
  completion_time_seconds INT DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  details JSONB
);

-- Ensure missing columns are added and NOT NULL constraints relaxed
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS student_name TEXT DEFAULT 'Anonymous';
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT 'Anonymous';
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Anonymous';
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'General';
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS os_type TEXT DEFAULT 'WIN10';
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS task_title TEXT DEFAULT 'OS Task';
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS total_earned INT DEFAULT 0;
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS total_max INT DEFAULT 100;
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS percentage INT DEFAULT 0;
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS grade TEXT DEFAULT 'N/A';
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS passed BOOLEAN DEFAULT false;
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS completion_time_seconds INT DEFAULT 60;
ALTER TABLE public.student_scores ADD COLUMN IF NOT EXISTS details JSONB;

-- Drop NOT NULL constraints on columns that might cause insert errors
ALTER TABLE public.student_scores ALTER COLUMN student_name DROP NOT NULL;
ALTER TABLE public.student_scores ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.student_scores ALTER COLUMN section DROP NOT NULL;

-- 2. Create or update evaluations table
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT,
  full_name TEXT,
  section TEXT,
  os_type TEXT,
  task_title TEXT,
  score INT,
  grade TEXT,
  passed BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS student_name TEXT DEFAULT 'Anonymous';
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT 'Anonymous';
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'General';
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS os_type TEXT DEFAULT 'WIN10';
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS task_title TEXT DEFAULT 'OS Task';
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS score INT DEFAULT 0;
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS grade TEXT DEFAULT 'N/A';
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS passed BOOLEAN DEFAULT false;

-- 3. Create or update students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  full_name TEXT,
  student_name TEXT,
  section TEXT,
  score INT,
  grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Anonymous';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT 'Anonymous';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_name TEXT DEFAULT 'Anonymous';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'General';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS score INT DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS grade TEXT DEFAULT 'N/A';
ALTER TABLE public.students ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.students ALTER COLUMN name DROP NOT NULL;

-- 4. CRITICAL: Disable Row Level Security (RLS) on all tables so anonymous submissions work
ALTER TABLE public.student_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;

-- 5. Grant permissions to anonymous users
GRANT ALL ON TABLE public.student_scores TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.evaluations TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.students TO anon, authenticated, postgres, service_role;
`;

export async function saveStudentScoreToSupabase(result: EvaluationResult): Promise<{ success: boolean; error?: string }> {
  // 1. Always save to LocalStorage cache first
  try {
    const existingStr = localStorage.getItem('os_simulator_student_logs');
    const existingLogs: EvaluationResult[] = existingStr ? JSON.parse(existingStr) : [];
    
    // Check for existing record with same student and timestamp window
    const isAlreadySaved = existingLogs.some(
      l => l.student.name === result.student.name && l.timestamp === result.timestamp
    );

    if (!isAlreadySaved) {
      existingLogs.unshift(result);
      localStorage.setItem('os_simulator_student_logs', JSON.stringify(existingLogs.slice(0, 100)));
    }
  } catch (localStorageErr) {
    console.warn('Failed to save to local cache:', localStorageErr);
  }

  // Helper function to dynamically strip missing columns and retry
  let successCount = 0;
  let lastErrorMsg = '';

  const trySmartInsert = async (tableName: string, payload: Record<string, any>): Promise<boolean> => {
    let currentPayload = { ...payload };

    for (let attempt = 0; attempt < 8; attempt++) {
      console.log(`Attempting insert into ${tableName} (attempt ${attempt + 1}):`, currentPayload);
      const { error } = await supabase.from(tableName).insert([currentPayload]);

      if (!error) {
        console.log(`Successfully inserted into ${tableName}`);
        return true;
      }

      console.warn(`Insert error in ${tableName}:`, error.message);
      lastErrorMsg = error.message;

      // Extract missing column name if schema cache missing error or relation does not exist error
      const missingMatch = 
        error.message.match(/Could not find the '([^']+)' column/i) ||
        error.message.match(/column ["']([^"']+)["'] of relation ["'][^"']+["'] does not exist/i);

      if (missingMatch && missingMatch[1] && currentPayload[missingMatch[1]] !== undefined) {
        const missingCol = missingMatch[1];
        console.warn(`Stripping missing column '${missingCol}' and retrying insert into ${tableName}...`);
        delete currentPayload[missingCol];
        if (Object.keys(currentPayload).length === 0) break;
        continue;
      }

      // Handle NOT NULL constraint errors automatically
      // e.g. "null value in column "full_name" of relation "students" violates not-null constraint"
      const nullMatch = error.message.match(/null value in column ["']([^"']+)["']/i);
      if (nullMatch && nullMatch[1]) {
        const nullCol = nullMatch[1];
        console.warn(`Providing fallback default for NOT NULL column '${nullCol}' and retrying insert into ${tableName}...`);
        
        let fallbackVal: any = result.student.name || 'Anonymous Student';
        if (nullCol.includes('time') || nullCol.includes('score') || nullCol.includes('percent') || nullCol.includes('total') || nullCol.includes('count')) {
          fallbackVal = 0;
        } else if (nullCol.includes('pass') || nullCol.includes('is_')) {
          fallbackVal = false;
        }

        currentPayload[nullCol] = fallbackVal;
        continue;
      }

      // Not a missing column or null constraint error (e.g., RLS error), stop retry for this table
      break;
    }

    return false;
  };

  // A. Try `student_scores` table
  const studentScoresPayload = {
    student_name: result.student.name || 'Anonymous Student',
    full_name: result.student.name || 'Anonymous Student',
    name: result.student.name || 'Anonymous Student',
    student_id: result.student.studentId || '',
    first_name: result.student.firstName || '',
    middle_initial: result.student.middleInitial || '',
    last_name: result.student.lastName || '',
    teacher_name: result.student.teacherName || '',
    teacher_email: result.student.teacherEmail || '',
    section: result.student.section || 'General',
    os_type: (result.selectedOS || 'win10').toUpperCase(),
    task_title: result.task?.title || 'OS Installation Task',
    total_earned: Number(result.totalEarned || 0),
    total_max: Number(result.totalMax || 100),
    percentage: Number(result.percentage || 0),
    grade: String(result.grade || 'N/A'),
    passed: Boolean(result.passed),
    completion_time_seconds: Number(result.completionTimeSeconds || 60),
    details: {
      scoreDetails: result.scoreDetails || [],
      student: result.student
    }
  };

  if (await trySmartInsert('student_scores', studentScoresPayload)) {
    successCount++;
  }

  // B. Try `evaluations` table
  const evalPayload = {
    student_name: result.student.name || 'Anonymous Student',
    full_name: result.student.name || 'Anonymous Student',
    name: result.student.name || 'Anonymous Student',
    section: result.student.section || 'General',
    os_type: (result.selectedOS || 'win10').toUpperCase(),
    task_title: result.task?.title || 'OS Installation Task',
    score: Number(result.percentage || 0),
    grade: String(result.grade || 'N/A'),
    passed: Boolean(result.passed)
  };

  if (await trySmartInsert('evaluations', evalPayload)) {
    successCount++;
  }

  // C. Try `students` table
  const studentPayload = {
    name: result.student.name || 'Anonymous Student',
    full_name: result.student.name || 'Anonymous Student',
    student_name: result.student.name || 'Anonymous Student',
    section: result.student.section || 'General',
    score: Number(result.percentage || 0),
    grade: String(result.grade || 'N/A')
  };

  if (await trySmartInsert('students', studentPayload)) {
    successCount++;
  }

  if (successCount > 0) {
    return { success: true };
  } else {
    return { 
      success: false, 
      error: lastErrorMsg || 'Row Level Security (RLS) is blocking inserts. Disable RLS in Supabase SQL Editor.' 
    };
  }
}

export async function fetchStudentScoresFromSupabase(): Promise<EvaluationResult[]> {
  let dbResults: EvaluationResult[] = [];

  // 1. Attempt fetch from Supabase table student_scores
  try {
    const { data, error } = await supabase
      .from('student_scores')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      dbResults = data.map((row) => {
        const studentDetail = row.details?.student || {};
        return {
          student: {
            name: row.student_name || row.full_name || row.name || studentDetail.name || 'Anonymous Student',
            section: row.section || studentDetail.section || 'General',
            studentId: row.student_id || studentDetail.studentId || '',
            firstName: row.first_name || studentDetail.firstName || '',
            middleInitial: row.middle_initial || studentDetail.middleInitial || '',
            lastName: row.last_name || studentDetail.lastName || '',
            teacherName: row.teacher_name || studentDetail.teacherName || '',
            teacherEmail: row.teacher_email || studentDetail.teacherEmail || ''
          },
          task: {
            id: 'task_db',
            title: row.task_title || 'OS Installation Task',
            os: (row.os_type || 'win10').toLowerCase() as any,
            diskSizeGB: 250,
            biosReq: { bootOrder: 'usb_first', bootMode: 'legacy', sataMode: 'ahci', secureBoot: false, tpmEnabled: false },
            partitionReq: { primarySizeGB: 100, primaryToleranceGB: 5, secondPartitionRequired: false, formatTargetPartition: true, targetPartitionIndex: 1 },
            description: row.task_title || 'OS Installation Task'
          },
          selectedOS: (row.os_type || 'win10').toLowerCase() as any,
          scoreDetails: Array.isArray(row.details) ? row.details : (row.details?.scoreDetails || []),
          totalEarned: row.total_earned || 0,
          totalMax: row.total_max || 100,
          percentage: row.percentage || 0,
          grade: row.grade || 'N/A',
          passed: Boolean(row.passed),
          completionTimeSeconds: row.completion_time_seconds || 60,
          timestamp: new Date(row.created_at || Date.now()).toLocaleString()
        };
      });
    } else if (error) {
      console.warn('Supabase fetch student_scores error:', error.message);
    }
  } catch (err) {
    console.warn('Failed to fetch from Supabase:', err);
  }

  // 2. Fallback fetch from evaluations table if student_scores was empty
  if (dbResults.length === 0) {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        dbResults = data.map((row) => ({
          student: { name: row.student_name || row.full_name || row.name || 'Anonymous Student', section: row.section || 'General' },
          task: {
            id: 'task_eval',
            title: row.task_title || 'OS Installation Task',
            os: (row.os_type || 'win10').toLowerCase() as any,
            diskSizeGB: 250,
            biosReq: { bootOrder: 'usb_first', bootMode: 'legacy', sataMode: 'ahci', secureBoot: false, tpmEnabled: false },
            partitionReq: { primarySizeGB: 100, primaryToleranceGB: 5, secondPartitionRequired: false, formatTargetPartition: true, targetPartitionIndex: 1 },
            description: row.task_title || 'OS Installation Task'
          },
          selectedOS: (row.os_type || 'win10').toLowerCase() as any,
          scoreDetails: [],
          totalEarned: row.score || 0,
          totalMax: 100,
          percentage: row.score || 0,
          grade: row.grade || 'N/A',
          passed: Boolean(row.passed),
          completionTimeSeconds: 60,
          timestamp: new Date(row.created_at || Date.now()).toLocaleString()
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch evaluations:', err);
    }
  }

  // 3. Fallback fetch from students table if evaluations was also empty
  if (dbResults.length === 0) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        dbResults = data.map((row) => ({
          student: { name: row.student_name || row.full_name || row.name || 'Anonymous Student', section: row.section || 'General' },
          task: {
            id: 'task_students',
            title: 'OS Installation Task',
            os: 'win10' as any,
            diskSizeGB: 250,
            biosReq: { bootOrder: 'usb_first', bootMode: 'legacy', sataMode: 'ahci', secureBoot: false, tpmEnabled: false },
            partitionReq: { primarySizeGB: 100, primaryToleranceGB: 5, secondPartitionRequired: false, formatTargetPartition: true, targetPartitionIndex: 1 },
            description: 'OS Installation Task'
          },
          selectedOS: 'win10' as any,
          scoreDetails: [],
          totalEarned: row.score || 0,
          totalMax: 100,
          percentage: row.score || 0,
          grade: row.grade || 'N/A',
          passed: (row.score || 0) >= 75,
          completionTimeSeconds: 60,
          timestamp: new Date(row.created_at || Date.now()).toLocaleString()
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch students:', err);
    }
  }

  // 3. Fetch local storage backup and merge
  let localResults: EvaluationResult[] = [];
  try {
    const stored = localStorage.getItem('os_simulator_student_logs');
    if (stored) {
      localResults = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to read local storage logs:', e);
  }

  // Combine and remove duplicates
  const combined = [...dbResults];
  for (const localItem of localResults) {
    const exists = combined.some(
      dbItem => dbItem.student.name === localItem.student.name && dbItem.timestamp === localItem.timestamp
    );
    if (!exists) {
      combined.push(localItem);
    }
  }

  return combined;
}
