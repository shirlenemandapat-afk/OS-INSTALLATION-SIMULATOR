import React, { useState, useEffect } from 'react';
import { StudentInfo, TeacherAccount } from '../types';
import {
  fetchRegisteredTeachers,
  registerTeacherAccount,
  registerStudentAccount,
  loginStudentAccount
} from '../lib/supabase';
import {
  GraduationCap,
  Briefcase,
  User,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  School,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  IdCard
} from 'lucide-react';

interface SignInDashboardProps {
  onStudentSignIn: (student: StudentInfo) => void;
  onTeacherSignIn: (teacher: TeacherAccount) => void;
  initialRole?: 'student' | 'teacher';
}

export const SignInDashboard: React.FC<SignInDashboardProps> = ({
  onStudentSignIn,
  onTeacherSignIn,
  initialRole = 'student'
}) => {
  // Role Selection First State - defaults to 'select'
  const [selectedRole, setSelectedRole] = useState<'select' | 'student' | 'teacher'>('select');
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>(initialRole);

  // Student Form State - Default to 'login' (Sign In options first)
  const [studentMode, setStudentMode] = useState<'register' | 'login'>('login');
  const [lrn, setLrn] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [section, setSection] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [studentError, setStudentError] = useState('');
  const [studentSuccess, setStudentSuccess] = useState('');
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // Registered Teachers List (dynamic)
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  // Teacher Form State - Default to 'login' (Sign In options first)
  const [teacherMode, setTeacherMode] = useState<'register' | 'login'>('login');
  const [teacherFullName, setTeacherFullName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherEmployeeId, setTeacherEmployeeId] = useState('');
  const [teacherDepartment, setTeacherDepartment] = useState('TVL - Computer Systems Servicing (CSS NC II)');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [teacherError, setTeacherError] = useState('');
  const [teacherSuccess, setTeacherSuccess] = useState('');
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState(false);

  // Load registered teachers on mount
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const list = await fetchRegisteredTeachers();
      setTeachers(list);
    } catch (e) {
      console.warn('Failed to load teachers:', e);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  // Handle Student Registration / Sign In
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');
    setStudentSuccess('');

    if (studentMode === 'register') {
      if (!lrn.trim()) {
        setStudentError('Please enter your 12-digit LRN Number.');
        return;
      }
      if (!firstName.trim()) {
        setStudentError('Please enter your First Name.');
        return;
      }
      if (!lastName.trim()) {
        setStudentError('Please enter your Last Name.');
        return;
      }
      if (!section.trim()) {
        setStudentError('Please enter your Year and Section.');
        return;
      }
      if (!selectedTeacherId) {
        if (teachers.length === 0) {
          setStudentError('No registered teacher accounts found in the system yet. Please ask your teacher to register in the TEACHER TAB first.');
        } else {
          setStudentError('Please select your assigned Teacher from the dropdown list.');
        }
        return;
      }
      if (!studentPassword.trim()) {
        setStudentError('Please create a password for your student account.');
        return;
      }

      const assignedTeacher = teachers.find((t) => t.id === selectedTeacherId);

      setIsSubmittingStudent(true);
      const res = await registerStudentAccount({
        lrn: lrn.trim(),
        firstName: firstName.trim(),
        middleInitial: middleInitial.trim(),
        lastName: lastName.trim(),
        section: section.trim(),
        teacherId: assignedTeacher?.id || '',
        teacherName: assignedTeacher?.fullName || 'Assigned Teacher',
        teacherEmail: assignedTeacher?.email || '',
        password: studentPassword.trim()
      });
      setIsSubmittingStudent(false);

      if (res.success && res.student) {
        setStudentSuccess(`Account registered successfully for ${res.student.name}! Opening simulator...`);
        const studentData: StudentInfo = {
          lrn: res.student.lrn,
          studentId: res.student.lrn,
          firstName: res.student.firstName,
          middleInitial: res.student.middleInitial,
          lastName: res.student.lastName,
          name: res.student.name,
          section: res.student.section,
          teacherId: res.student.teacherId,
          teacherName: res.student.teacherName,
          teacherEmail: res.student.teacherEmail,
          password: res.student.password
        };
        setTimeout(() => {
          onStudentSignIn(studentData);
        }, 800);
      } else {
        setStudentError(res.error || 'Failed to register student account.');
      }
    } else {
      // Student Login Mode
      if (!lrn.trim()) {
        setStudentError('Please enter your LRN Number.');
        return;
      }
      if (!studentPassword.trim()) {
        setStudentError('Please enter your account password.');
        return;
      }

      setIsSubmittingStudent(true);
      const res = await loginStudentAccount(lrn.trim(), studentPassword.trim());
      setIsSubmittingStudent(false);

      if (res.success && res.student) {
        setStudentSuccess(`Welcome back, ${res.student.name}! Launching simulator...`);
        const studentData: StudentInfo = {
          lrn: res.student.lrn,
          studentId: res.student.lrn,
          firstName: res.student.firstName,
          middleInitial: res.student.middleInitial,
          lastName: res.student.lastName,
          name: res.student.name,
          section: res.student.section,
          teacherId: res.student.teacherId,
          teacherName: res.student.teacherName,
          teacherEmail: res.student.teacherEmail,
          password: res.student.password
        };
        setTimeout(() => {
          onStudentSignIn(studentData);
        }, 800);
      } else {
        setStudentError(res.error || 'Invalid LRN Number or Password.');
      }
    }
  };

  // Quick-fill sample student for easy testing
  const handleFillSampleStudent = () => {
    setStudentMode('register');
    setLrn('108294719283');
    setFirstName('Juan');
    setMiddleInitial('P.');
    setLastName('Dela Cruz');
    setSection('Grade 11 - TVL ICT 1');
    setStudentPassword('student123');
    if (teachers.length > 0) {
      setSelectedTeacherId(teachers[0].id);
    }
    setStudentError('');
  };

  // Handle Teacher Registration / Sign In
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');
    setTeacherSuccess('');

    if (teacherMode === 'register') {
      if (!teacherFullName.trim()) {
        setTeacherError('Please enter your Full Name.');
        return;
      }
      if (!teacherEmail.trim()) {
        setTeacherError('Please enter your DepEd QC email address.');
        return;
      }
      if (!teacherPassword.trim()) {
        setTeacherError('Please create a password for your teacher account.');
        return;
      }

      setIsSubmittingTeacher(true);
      const res = await registerTeacherAccount({
        fullName: teacherFullName.trim(),
        email: teacherEmail.trim(),
        department: teacherDepartment.trim(),
        employeeId: teacherEmployeeId.trim(),
        password: teacherPassword
      });
      setIsSubmittingTeacher(false);

      if (res.success && res.teacher) {
        setTeacherSuccess(`Teacher account registered for ${res.teacher.fullName}! Opening dashboard...`);
        await loadTeachers();
        setTimeout(() => {
          onTeacherSignIn(res.teacher!);
        }, 800);
      } else {
        setTeacherError(res.error || 'Failed to register teacher account.');
      }
    } else {
      // Teacher Sign In
      if (!teacherEmail.trim()) {
        setTeacherError('Please enter your DepEd QC email.');
        return;
      }

      const found = teachers.find(
        (t) => t.email.toLowerCase() === teacherEmail.trim().toLowerCase()
      );

      if (!found) {
        setTeacherError('No registered teacher account found with this email. Please register your account above.');
        return;
      }

      if (found.password && teacherPassword && found.password !== teacherPassword) {
        setTeacherError('Incorrect password. Please verify your credentials or register a new account.');
        return;
      }

      onTeacherSignIn(found);
    }
  };

  const handleQuickTeacherSelect = (teacher: TeacherAccount) => {
    setTeacherEmail(teacher.email);
    setTeacherPassword(teacher.password || 'password123');
    setTeacherMode('login');
  };

  // 1. FIRST DISPLAY: Role Selection Screen (Student vs Teacher)
  if (selectedRole === 'select') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-sm">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                OS Installation & BIOS Lab Assessment Portal
              </h1>
            </div>
          </div>

          <div className="text-right hidden md:block">
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Cloud Gradebook Active
            </p>
          </div>
        </header>

        {/* Main Container: Select Role First */}
        <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col items-center justify-center">
          {/* Welcome Tagline */}
          <div className="text-center mb-8 space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-950/80 text-blue-400 border border-blue-800/60">
              <UserCheck className="w-3.5 h-3.5" />
              DepEd QC Assessment System
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Select Your Account Role
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Please choose your role first to proceed to the sign in & registration dashboard.
            </p>
          </div>

          {/* Role Selection Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* STUDENT ROLE CARD */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                setActiveTab('student');
                setStudentError('');
                setStudentSuccess('');
              }}
              className="group relative bg-slate-900/90 hover:bg-slate-900 border-2 border-slate-800 hover:border-blue-500 rounded-3xl p-6 sm:p-8 text-left transition-all duration-300 shadow-2xl hover:shadow-blue-500/20 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                  <GraduationCap className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950 px-2.5 py-1 rounded-md border border-blue-800/60 inline-block">
                    Student Portal
                  </span>
                  <h3 className="text-xl font-black text-white mt-2 group-hover:text-blue-300 transition-colors">
                    STUDENT
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Sign in or register using your <strong>12-digit LRN Number</strong> and password to perform virtual OS installation & BIOS lab practical assessment tasks.
                  </p>
                </div>

                <ul className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Enter 12-digit LRN & Password</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Select registered DepEd QC Teacher</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Perform Windows 7, 10, 11 & BIOS tasks</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-extrabold text-blue-400 group-hover:text-blue-300">
                <span>Continue as Student</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* TEACHER ROLE CARD */}
            <button
              type="button"
              onClick={() => {
                setSelectedRole('teacher');
                setActiveTab('teacher');
                setTeacherError('');
                setTeacherSuccess('');
              }}
              className="group relative bg-slate-900/90 hover:bg-slate-900 border-2 border-slate-800 hover:border-indigo-500 rounded-3xl p-6 sm:p-8 text-left transition-all duration-300 shadow-2xl hover:shadow-indigo-500/20 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                  <Briefcase className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-800/60 inline-block">
                    Teacher Portal
                  </span>
                  <h3 className="text-xl font-black text-white mt-2 group-hover:text-indigo-300 transition-colors">
                    TEACHER
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Sign in or register with your official <strong>DepEd QC email</strong> to evaluate student scores, monitor class gradebooks, and review logs.
                  </p>
                </div>

                <ul className="space-y-2 pt-3 border-t border-slate-800 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Register official DepEd QC email</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Monitor student performance & scores</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Review automated rubrics & logs</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-extrabold text-indigo-400 group-hover:text-indigo-300">
                <span>Continue as Teacher</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Informational Footer */}
          <div className="mt-10 text-center text-xs text-slate-500 space-y-1">
            <p>DepEd Quezon City • Computer Systems Servicing NC II Virtual Assessment Environment</p>
            <p className="text-[11px] text-slate-600">
              Compliant with TESDA Training Regulations & DepEd Senior High School TVL-ICT Curriculum
            </p>
          </div>
        </main>
      </div>
    );
  }

  // 2. SECOND DISPLAY: Sign In Dashboard (After selecting role)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-sm">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              OS Installation & BIOS Lab Assessment Portal
            </h1>
          </div>
        </div>

        <div className="text-right hidden md:block">
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Cloud Gradebook Active
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col items-center justify-center">
        {/* Outer Card with Navigation Tabs */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* ROLE-SPECIFIC PORTAL BARS */}
          {activeTab === 'student' ? (
            <div className="p-4 sm:px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/80 flex items-center justify-center text-blue-400 shadow-md">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60 inline-block mb-0.5">
                    STUDENT PORTAL
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    OS Installation & BIOS Practical Assessment Portal
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole('select')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
                <span>Change Role</span>
              </button>
            </div>
          ) : (
            <div className="p-4 sm:px-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800/80 flex items-center justify-center text-indigo-400 shadow-md">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60 inline-block mb-0.5">
                    TEACHER PORTAL
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    DepEd QC Teacher Gradebook & Results Access
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole('select')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
                <span>Change Role</span>
              </button>
            </div>
          )}

          {/* TAB 1: STUDENT TAB (REGISTER / LOGIN WITH LRN & PASSWORD) */}
          {activeTab === 'student' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-slate-800/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  Student Account Portal
                </h3>
                <p className="text-xs text-slate-400">
                  {studentMode === 'login'
                    ? 'Sign in with your registered LRN Number and Password.'
                    : 'Register your 12-digit LRN Number, Name, Section, and Teacher.'}
                </p>
              </div>

              {studentError && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{studentError}</span>
                </div>
              )}

              {studentSuccess && (
                <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{studentSuccess}</span>
                </div>
              )}

              {studentMode === 'register' ? (
                /* STUDENT REGISTRATION FORM */
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  {/* 1. LRN NUMBER */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-blue-400" />
                      <span>LRN NUMBER (LEARNER REFERENCE NUMBER)</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={lrn}
                      onChange={(e) => {
                        setLrn(e.target.value);
                        setStudentError('');
                      }}
                      placeholder="Enter your 12-digit LRN Number (e.g. 102938475612)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>

                  {/* 2. NAMES (FIRST NAME, MIDDLE INITIAL, LAST NAME) */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        FIRST NAME <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          setStudentError('');
                        }}
                        placeholder="e.g. Juan"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        M.I.
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        value={middleInitial}
                        onChange={(e) => {
                          setMiddleInitial(e.target.value.toUpperCase());
                        }}
                        placeholder="e.g. P."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 text-center placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        LAST NAME <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          setStudentError('');
                        }}
                        placeholder="e.g. Dela Cruz"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* 3. YEAR AND SECTION */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      YEAR AND SECTION <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => {
                        setSection(e.target.value);
                        setStudentError('');
                      }}
                      placeholder="e.g. Grade 11 - TVL ICT 1 or BSIT 2-A"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  {/* 4. SELECT YOUR TEACHER (BASED STRICTLY ON REGISTERED ACCOUNTS) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        <span>SELECT YOUR TEACHER</span>
                        <span className="text-rose-400">*</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Selection based on registered teacher accounts
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedTeacherId}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                        className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10 cursor-pointer"
                      >
                        {teachers.length === 0 ? (
                          <option value="">-- No registered teachers available yet (Please ask teacher to register in Teacher Tab) --</option>
                        ) : (
                          <>
                            <option value="">-- Select Your Teacher --</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100 py-1">
                                {t.fullName} — {t.department || 'DepEd QC ICT'} ({t.email})
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* 5. CREATE PASSWORD */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>CREATE STUDENT PASSWORD</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showStudentPassword ? 'text' : 'password'}
                        value={studentPassword}
                        onChange={(e) => {
                          setStudentPassword(e.target.value);
                          setStudentError('');
                        }}
                        placeholder="Create a password for your student LRN account"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmittingStudent}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{isSubmittingStudent ? 'Registering Student Account...' : 'Register Student Account & Proceed to Simulator'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentMode('login');
                        setStudentError('');
                        setStudentSuccess('');
                      }}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
                    >
                      Already registered? Click here to Sign In with LRN & Password &rarr;
                    </button>
                  </div>
                </form>
              ) : (
                /* STUDENT LOGIN FORM */
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <IdCard className="w-3.5 h-3.5 text-blue-400" />
                      <span>LRN NUMBER</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={lrn}
                      onChange={(e) => {
                        setLrn(e.target.value);
                        setStudentError('');
                      }}
                      placeholder="Enter your 12-digit LRN Number"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>STUDENT PASSWORD</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showStudentPassword ? 'text' : 'password'}
                        value={studentPassword}
                        onChange={(e) => {
                          setStudentPassword(e.target.value);
                          setStudentError('');
                        }}
                        placeholder="Enter your student account password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingStudent}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{isSubmittingStudent ? 'Signing In...' : 'Sign In with LRN & Password'}</span>
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStudentMode('register');
                        setStudentError('');
                        setStudentSuccess('');
                      }}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
                    >
                      Not registered yet? Click here to register your Student LRN Account &rarr;
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: TEACHER TAB (REGISTER DEPEDQC EMAIL / SIGN IN) */}
          {activeTab === 'teacher' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="pb-4 border-b border-slate-800/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  Teacher Account & Results Portal
                </h3>
                <p className="text-xs text-slate-400">
                  {teacherMode === 'login'
                    ? 'Sign in with your registered DepEd QC email and password.'
                    : 'Register your DepEd QC email to monitor and evaluate your students.'}
                </p>
              </div>

              {teacherError && (
                <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{teacherError}</span>
                </div>
              )}

              {teacherSuccess && (
                <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{teacherSuccess}</span>
                </div>
              )}

              {teacherMode === 'register' ? (
                /* REGISTRATION FORM */
                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/50 rounded-2xl flex items-start gap-3">
                    <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-0.5 text-slate-300">
                      <p className="font-semibold text-white">DepEd QC Official Registration</p>
                      <p className="text-slate-400 text-[11px]">
                        Requires a valid DepEd QC email address (e.g. <span className="text-indigo-300 font-mono">name@depedqc.ph</span>). Upon registration, your name will immediately appear in the student teacher selection list.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        TEACHER FULL NAME <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={teacherFullName}
                        onChange={(e) => {
                          setTeacherFullName(e.target.value);
                          setTeacherError('');
                        }}
                        placeholder="e.g. Ms. Shirlene Dela Cruz"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        DEPED QC EMAIL ADDRESS <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={teacherEmail}
                        onChange={(e) => {
                          setTeacherEmail(e.target.value);
                          setTeacherError('');
                        }}
                        placeholder="e.g. shirlene.delacruz@depedqc.ph"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        EMPLOYEE / DEPED ID NUMBER
                      </label>
                      <input
                        type="text"
                        value={teacherEmployeeId}
                        onChange={(e) => setTeacherEmployeeId(e.target.value)}
                        placeholder="e.g. QC-DEPED-2024-001"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        DEPARTMENT / SUBJECT AREA
                      </label>
                      <input
                        type="text"
                        value={teacherDepartment}
                        onChange={(e) => setTeacherDepartment(e.target.value)}
                        placeholder="e.g. TVL - Computer Systems Servicing"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      CREATE PASSWORD <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={teacherPassword}
                        onChange={(e) => {
                          setTeacherPassword(e.target.value);
                          setTeacherError('');
                        }}
                        placeholder="Create a password for your dashboard access"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmittingTeacher}
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>{isSubmittingTeacher ? 'Registering DepEd QC Account...' : 'Register DepEd QC Account & Open Dashboard'}</span>
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherMode('login');
                        setTeacherError('');
                        setTeacherSuccess('');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
                    >
                      Already registered? Click here to Sign In &rarr;
                    </button>
                  </div>
                </form>
              ) : (
                /* LOGIN FORM */
                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      DEPED QC EMAIL ADDRESS <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={teacherEmail}
                      onChange={(e) => {
                        setTeacherEmail(e.target.value);
                        setTeacherError('');
                      }}
                      placeholder="e.g. shirlene.delacruz@depedqc.ph"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      ACCOUNT PASSWORD <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={teacherPassword}
                        onChange={(e) => {
                          setTeacherPassword(e.target.value);
                          setTeacherError('');
                        }}
                        placeholder="Enter your teacher password"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Sign In to Teacher Dashboard</span>
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherMode('register');
                        setTeacherError('');
                        setTeacherSuccess('');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
                    >
                      Not registered yet? Click here to register your DepEd QC Teacher Account &rarr;
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Informational Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 space-y-1">
          <p>DepEd Quezon City • Computer Systems Servicing NC II Virtual Assessment Environment</p>
          <p className="text-[11px] text-slate-600">
            Compliant with TESDA Training Regulations & DepEd Senior High School TVL-ICT Curriculum
          </p>
        </div>
      </main>
    </div>
  );
};
