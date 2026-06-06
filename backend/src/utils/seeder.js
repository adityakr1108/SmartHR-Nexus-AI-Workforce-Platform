/**
 * SmartHR Nexus — Database Seeder
 * Run: node src/utils/seeder.js
 * Run (reset): node src/utils/seeder.js --reset
 */

require('dotenv').config();
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const mongoose = require('mongoose');

// ─── Models ──────────────────────────────────────────────────────────────────
const userSchema = require('../models/User.model');

// Inline schemas for seeder (avoids circular deps)
const departmentSchema = new mongoose.Schema({
  name: String, code: String, description: String,
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentDept: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  budget: Number, location: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  employeeType: { type: String, default: 'full_time' },
  workLocation: { type: String, default: 'office' },
  shift: { type: { type: String, default: 'morning' }, startTime: { type: String, default: '09:00' }, endTime: { type: String, default: '18:00' } },
  probationEndDate: Date, confirmationDate: Date,
  noticePeriod: { type: Number, default: 30 },
  status: { type: String, default: 'active' },
  leaveBalance: { annual: { type: Number, default: 21 }, sick: { type: Number, default: 10 }, casual: { type: Number, default: 7 } },
  payrollDetails: { ctc: Number, inHandSalary: Number, panNumber: String, taxRegime: { type: String, default: 'new' } },
  performanceRating: { type: Number, default: 0 },
  skills: [String],
  goals: [{
    title: String, description: String, targetDate: Date,
    status: { type: String, default: 'in_progress' }, progress: { type: Number, default: 0 },
  }],
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  checkIn: { time: Date, method: String },
  checkOut: { time: Date, method: String },
  totalHours: Number, overtimeHours: { type: Number, default: 0 },
  status: { type: String, default: 'present' },
  workMode: { type: String, default: 'office' },
}, { timestamps: true });

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payPeriod: { month: Number, year: Number, startDate: Date, endDate: Date },
  earnings: { basicSalary: Number, houseRentAllowance: Number, conveyanceAllowance: Number, medicalAllowance: Number, performanceBonus: { type: Number, default: 0 }, specialAllowance: Number },
  deductions: { providentFund: Number, employeeStateInsurance: Number, professionalTax: Number, incomeTax: Number },
  grossEarnings: Number, totalDeductions: Number, netSalary: Number,
  status: { type: String, default: 'paid' },
  paymentDetails: { method: { type: String, default: 'bank_transfer' }, paidAt: Date },
  attendanceSummary: { totalWorkingDays: Number, presentDays: Number, absentDays: Number, leaveDays: Number },
}, { timestamps: true });

const leaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leaveType: String, reason: String,
  startDate: Date, endDate: Date, totalDays: Number,
  status: { type: String, default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date, comments: String,
}, { timestamps: true });

const performanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewCycle: { type: { type: String, default: 'quarterly' }, period: String, startDate: Date, endDate: Date },
  ratings: {
    technical: { score: Number, comments: String },
    communication: { score: Number, comments: String },
    teamwork: { score: Number, comments: String },
    leadership: { score: Number, comments: String },
    productivity: { score: Number, comments: String },
  },
  overallRating: Number,
  strengths: [String], areasOfImprovement: [String],
  managerComments: String, status: { type: String, default: 'completed' },
  aiInsights: { summary: String, recommendations: [String] },
}, { timestamps: true });

const jobSchema = new mongoose.Schema({
  title: String, department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  description: String, requirements: [String], skills: [String],
  experience: { min: Number, max: Number },
  salary: { min: Number, max: Number, currency: { type: String, default: 'USD' } },
  location: String, workType: String, workMode: String,
  openings: Number, closingDate: Date,
  status: { type: String, default: 'open' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiScreeningEnabled: { type: Boolean, default: true },
  applicationCount: { type: Number, default: 0 },
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  candidate: { firstName: String, lastName: String, email: String, phone: String, currentPosition: String, currentCompany: String, totalExperience: Number, expectedSalary: Number },
  resumeUrl: String, stage: String,
  aiScreening: { score: Number, summary: String, strengths: [String], weaknesses: [String], recommendation: String, processedAt: Date },
  source: String,
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String, message: String, type: String,
  read: { type: Boolean, default: false },
  link: String,
}, { timestamps: true });

// ─── Register models ──────────────────────────────────────────────────────────
const Department  = mongoose.model('Department',       departmentSchema);
const Employee    = mongoose.model('Employee',         employeeSchema);
const Attendance  = mongoose.model('Attendance',       attendanceSchema);
const Payroll     = mongoose.model('Payroll',          payrollSchema);
const Leave       = mongoose.model('Leave',            leaveSchema);
const Performance = mongoose.model('PerformanceReview',performanceSchema);
const Job         = mongoose.model('Job',              jobSchema);
const Application = mongoose.model('Application',     applicationSchema);
const Notification= mongoose.model('Notification',    notificationSchema);
const User        = mongoose.model('User');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const dateOffset = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d; };
const monthStart = (y, m) => new Date(y, m - 1, 1);
const monthEnd   = (y, m) => new Date(y, m, 0);

// ─── Seed Data Definitions ────────────────────────────────────────────────────
const DEPARTMENTS_DATA = [
  { name: 'Engineering',      code: 'ENG',  description: 'Software development and architecture',       budget: 2500000, location: 'Floor 3' },
  { name: 'Human Resources',  code: 'HR',   description: 'Talent acquisition and employee relations',   budget: 800000,  location: 'Floor 1' },
  { name: 'Sales',            code: 'SLS',  description: 'Business development and revenue growth',     budget: 1200000, location: 'Floor 2' },
  { name: 'Marketing',        code: 'MKT',  description: 'Brand, campaigns and growth marketing',       budget: 900000,  location: 'Floor 2' },
  { name: 'Finance',          code: 'FIN',  description: 'Accounting, budgeting and financial planning',budget: 700000,  location: 'Floor 4' },
  { name: 'Product',          code: 'PRD',  description: 'Product management and roadmap',              budget: 600000,  location: 'Floor 3' },
  { name: 'Design',           code: 'DSN',  description: 'UX/UI and brand design',                      budget: 400000,  location: 'Floor 3' },
  { name: 'Operations',       code: 'OPS',  description: 'Business operations and process management',  budget: 500000,  location: 'Floor 1' },
];

const SKILLS_POOL = {
  Engineering: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'Docker', 'TypeScript', 'GraphQL', 'Redis', 'Kubernetes'],
  HR:          ['Recruitment', 'HRIS', 'Employee Relations', 'Payroll', 'Training', 'Compliance', 'SHRM'],
  Sales:       ['Salesforce', 'CRM', 'Negotiation', 'B2B Sales', 'Pipeline Management', 'Cold Outreach'],
  Marketing:   ['SEO', 'Google Ads', 'Content Strategy', 'HubSpot', 'Social Media', 'Analytics', 'Copywriting'],
  Finance:     ['Excel', 'QuickBooks', 'Financial Modelling', 'Tax Planning', 'Auditing', 'IFRS'],
  Product:     ['Agile', 'Jira', 'Roadmapping', 'User Research', 'Figma', 'OKRs', 'A/B Testing'],
  Design:      ['Figma', 'Adobe XD', 'Illustrator', 'Prototyping', 'User Research', 'Motion Design'],
  Operations:  ['Process Improvement', 'Lean', 'Six Sigma', 'Project Management', 'Vendor Management'],
};

// ─── Main Seeder ─────────────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 SmartHR Nexus — Database Seeder\n' + '─'.repeat(50));

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smarthr_nexus');
  console.log('✅ Connected to MongoDB');

  // Reset if requested
  if (process.argv.includes('--reset')) {
    console.log('🗑️  Dropping all collections...');
    await Promise.all([
      User.deleteMany({}), Department.deleteMany({}), Employee.deleteMany({}),
      Attendance.deleteMany({}), Payroll.deleteMany({}), Leave.deleteMany({}),
      Performance.deleteMany({}), Job.deleteMany({}), Application.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✅ Collections cleared\n');
  }

  // ── 1. Departments ──────────────────────────────────────────────────────────
  console.log('📁 Seeding departments...');
  const departments = await Department.insertMany(DEPARTMENTS_DATA);
  const deptMap = {};
  departments.forEach((d) => { deptMap[d.code] = d._id; });
  console.log(`   ✅ ${departments.length} departments created`);

  // ── 2. Users ────────────────────────────────────────────────────────────────
  console.log('👥 Seeding users...');

  const usersData = [
    // ── Core demo accounts (easy login) ──
    {
      firstName: 'Alex',      lastName: 'Morgan',   email: 'admin@demo.com',    password: 'Admin@1234',
      role: 'admin',          department: deptMap['HR'],  position: 'HR Director',
      phone: '+1-555-0101',   employeeId: 'EMP00001', isActive: true, isEmailVerified: true,
      dateOfJoining: new Date('2021-01-15'),
      salary: { basic: 12000, allowances: 3000, currency: 'USD' },
      address: { city: 'New York', state: 'NY', country: 'USA' },
    },
    {
      firstName: 'Sarah',     lastName: 'Chen',     email: 'manager@demo.com',  password: 'Manager@1234',
      role: 'senior_manager', department: deptMap['ENG'], position: 'Engineering Manager',
      phone: '+1-555-0102',   employeeId: 'EMP00002', isActive: true, isEmailVerified: true,
      dateOfJoining: new Date('2020-06-01'),
      salary: { basic: 10000, allowances: 2500, currency: 'USD' },
      address: { city: 'San Francisco', state: 'CA', country: 'USA' },
    },
    {
      firstName: 'Priya',     lastName: 'Patel',    email: 'hr@demo.com',       password: 'HR@12345',
      role: 'hr_recruiter',   department: deptMap['HR'],  position: 'HR Recruiter',
      phone: '+1-555-0103',   employeeId: 'EMP00003', isActive: true, isEmailVerified: true,
      dateOfJoining: new Date('2022-03-10'),
      salary: { basic: 7000, allowances: 1500, currency: 'USD' },
      address: { city: 'Austin', state: 'TX', country: 'USA' },
    },
    {
      firstName: 'James',     lastName: 'Wilson',   email: 'employee@demo.com', password: 'Employee@1234',
      role: 'employee',       department: deptMap['ENG'], position: 'Frontend Developer',
      phone: '+1-555-0104',   employeeId: 'EMP00004', isActive: true, isEmailVerified: true,
      dateOfJoining: new Date('2023-07-20'),
      salary: { basic: 6000, allowances: 1200, currency: 'USD' },
      address: { city: 'Chicago', state: 'IL', country: 'USA' },
    },
    // ── Additional employees ──
    { firstName: 'Emma',   lastName: 'Johnson', email: 'emma.johnson@company.com',  password: 'Pass@1234', role: 'employee', department: deptMap['ENG'], position: 'Senior Developer',     phone: '+1-555-0105', employeeId: 'EMP00005', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2021-08-12'), salary: { basic: 8500, allowances: 2000, currency: 'USD' } },
    { firstName: 'Liam',   lastName: 'Brown',   email: 'liam.brown@company.com',    password: 'Pass@1234', role: 'employee', department: deptMap['SLS'], position: 'Sales Executive',       phone: '+1-555-0106', employeeId: 'EMP00006', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2022-01-05'), salary: { basic: 6500, allowances: 1800, currency: 'USD' } },
    { firstName: 'Olivia', lastName: 'Davis',   email: 'olivia.davis@company.com',  password: 'Pass@1234', role: 'employee', department: deptMap['MKT'], position: 'Marketing Specialist',  phone: '+1-555-0107', employeeId: 'EMP00007', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2022-05-20'), salary: { basic: 6000, allowances: 1400, currency: 'USD' } },
    { firstName: 'Noah',   lastName: 'Martinez',email: 'noah.martinez@company.com', password: 'Pass@1234', role: 'employee', department: deptMap['FIN'], position: 'Financial Analyst',     phone: '+1-555-0108', employeeId: 'EMP00008', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2021-11-15'), salary: { basic: 7000, allowances: 1600, currency: 'USD' } },
    { firstName: 'Ava',    lastName: 'Taylor',  email: 'ava.taylor@company.com',    password: 'Pass@1234', role: 'employee', department: deptMap['PRD'], position: 'Product Manager',       phone: '+1-555-0109', employeeId: 'EMP00009', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2020-09-08'), salary: { basic: 9000, allowances: 2200, currency: 'USD' } },
    { firstName: 'Ethan',  lastName: 'Anderson',email: 'ethan.anderson@company.com',password: 'Pass@1234', role: 'employee', department: deptMap['DSN'], position: 'UI/UX Designer',        phone: '+1-555-0110', employeeId: 'EMP00010', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2023-01-16'), salary: { basic: 6800, allowances: 1500, currency: 'USD' } },
    { firstName: 'Sophia', lastName: 'Thomas',  email: 'sophia.thomas@company.com', password: 'Pass@1234', role: 'employee', department: deptMap['ENG'], position: 'Backend Developer',     phone: '+1-555-0111', employeeId: 'EMP00011', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2022-07-04'), salary: { basic: 8000, allowances: 1900, currency: 'USD' } },
    { firstName: 'Mason',  lastName: 'Jackson', email: 'mason.jackson@company.com', password: 'Pass@1234', role: 'employee', department: deptMap['OPS'], position: 'Operations Manager',    phone: '+1-555-0112', employeeId: 'EMP00012', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2019-12-01'), salary: { basic: 9500, allowances: 2400, currency: 'USD' } },
    { firstName: 'Isabella',lastName:'White',   email: 'isabella.white@company.com',password: 'Pass@1234', role: 'employee', department: deptMap['SLS'], position: 'Sales Manager',         phone: '+1-555-0113', employeeId: 'EMP00013', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2020-04-15'), salary: { basic: 8202, allowances: 2100, currency: 'USD' } },
    { firstName: 'Lucas',  lastName: 'Harris',  email: 'lucas.harris@company.com',  password: 'Pass@1234', role: 'employee', department: deptMap['ENG'], position: 'DevOps Engineer',       phone: '+1-555-0114', employeeId: 'EMP00014', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2021-03-22'), salary: { basic: 8800, allowances: 2000, currency: 'USD' } },
    { firstName: 'Mia',    lastName: 'Clark',   email: 'mia.clark@company.com',     password: 'Pass@1234', role: 'employee', department: deptMap['MKT'], position: 'Content Strategist',    phone: '+1-555-0115', employeeId: 'EMP00015', isActive: true, isEmailVerified: true, dateOfJoining: new Date('2023-04-10'), salary: { basic: 5800, allowances: 1200, currency: 'USD' } },
  ];

  const users = await User.create(usersData);
  console.log(`   ✅ ${users.length} users created`);

  const userMap = {};
  users.forEach((u) => { userMap[u.email] = u; });

  // Set dept heads
  await Department.findByIdAndUpdate(deptMap['HR'],  { head: userMap['admin@demo.com']._id });
  await Department.findByIdAndUpdate(deptMap['ENG'], { head: userMap['manager@demo.com']._id });
  await Department.findByIdAndUpdate(deptMap['SLS'], { head: userMap['isabella.white@company.com']._id });
  await Department.findByIdAndUpdate(deptMap['OPS'], { head: userMap['mason.jackson@company.com']._id });

  // Set reporting managers
  const engUsers = users.filter(u => u.department?.toString() === deptMap['ENG'].toString());
  for (const u of engUsers) {
    if (u.email !== 'manager@demo.com') {
      await User.findByIdAndUpdate(u._id, { reportingManager: userMap['manager@demo.com']._id });
    }
  }

  // ── 3. Employee Profiles ────────────────────────────────────────────────────
  console.log('🪪  Seeding employee profiles...');
  const deptNameMap = {};
  departments.forEach((d) => { deptNameMap[d._id.toString()] = d.name; });

  const empProfiles = users.map((u) => {
    const deptName = deptNameMap[u.department?.toString()] || 'Engineering';
    const skills   = SKILLS_POOL[deptName] || SKILLS_POOL['Engineering'];
    const ctc      = (u.salary.basic + u.salary.allowances) * 12;
    return {
      user: u._id,
      employeeType: rand(['full_time', 'full_time', 'full_time', 'contract']),
      workLocation: rand(['office', 'office', 'hybrid', 'remote']),
      status: 'active',
      performanceRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      skills: skills.slice(0, randInt(3, 6)),
      payrollDetails: { ctc, inHandSalary: Math.round(ctc * 0.72 / 12), taxRegime: 'new' },
      leaveBalance: { annual: randInt(14, 21), sick: randInt(5, 10), casual: randInt(3, 7) },
      confirmationDate: new Date(u.dateOfJoining.getTime() + 180 * 86400000),
      goals: [
        { title: 'Complete Q4 OKRs',         description: 'Hit all quarterly targets', targetDate: dateOffset(30),  status: 'in_progress', progress: randInt(40, 90) },
        { title: 'Skill certification',       description: 'Complete online course',    targetDate: dateOffset(60),  status: 'in_progress', progress: randInt(20, 60) },
        { title: 'Team knowledge sharing',    description: 'Conduct 2 tech talks',      targetDate: dateOffset(90),  status: 'pending',     progress: randInt(0, 30) },
      ],
    };
  });
  await Employee.insertMany(empProfiles);
  console.log(`   ✅ ${empProfiles.length} employee profiles created`);

  // ── 4. Attendance (last 60 days) ────────────────────────────────────────────
  console.log('🕐 Seeding attendance records...');
  const attendanceRecords = [];
  const today = new Date(); today.setHours(0,0,0,0);

  for (const user of users) {
    for (let d = 59; d >= 0; d--) {
      const date = new Date(today); date.setDate(today.getDate() - d);
      const day  = date.getDay();
      if (day === 0 || day === 6) continue; // skip weekends

      const rand100 = Math.random();
      let status, checkIn, checkOut, totalHours;

      if (rand100 < 0.04) {
        status = 'absent'; checkIn = null; checkOut = null; totalHours = 0;
      } else if (rand100 < 0.08) {
        status = 'on_leave'; checkIn = null; checkOut = null; totalHours = 0;
      } else {
        const isLate = Math.random() < 0.1;
        const ciHour = isLate ? randInt(9, 11) : 9;
        const ciMin  = isLate ? randInt(15, 59) : randInt(0, 14);
        const ciTime = new Date(date); ciTime.setHours(ciHour, ciMin, 0);
        const coHour = randInt(17, 19);
        const coMin  = randInt(0, 59);
        const coTime = new Date(date); coTime.setHours(coHour, coMin, 0);
        totalHours = parseFloat(((coTime - ciTime) / 3600000).toFixed(2));
        status  = isLate ? 'late' : 'present';
        checkIn = { time: ciTime, method: 'manual' };
        checkOut= { time: coTime, method: 'manual' };
      }

      attendanceRecords.push({
        employee: user._id, date,
        ...(checkIn ? { checkIn, checkOut } : {}),
        totalHours, status,
        workMode: rand(['office','office','office','hybrid','remote']),
      });
    }
  }
  await Attendance.insertMany(attendanceRecords);
  console.log(`   ✅ ${attendanceRecords.length} attendance records created`);

  // ── 5. Payroll (last 6 months) ───────────────────────────────────────────────
  console.log('💰 Seeding payroll records...');
  const payrollRecords = [];
  const now = new Date();

  for (const user of users) {
    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const month = d.getMonth() + 1;
      const year  = d.getFullYear();
      const basic = user.salary.basic;
      const hra   = Math.round(basic * 0.4);
      const conv  = Math.round(basic * 0.05);
      const med   = Math.round(basic * 0.04);
      const special= Math.round(basic * 0.1);
      const gross = basic + hra + conv + med + special;
      const pf    = Math.round(basic * 0.12);
      const esi   = Math.round(gross * 0.0075);
      const pt    = 200;
      const tax   = Math.round(gross * 0.1);
      const totalDed = pf + esi + pt + tax;
      const net   = gross - totalDed;

      payrollRecords.push({
        employee: user._id,
        payPeriod: { month, year, startDate: monthStart(year, month), endDate: monthEnd(year, month) },
        earnings: { basicSalary: basic, houseRentAllowance: hra, conveyanceAllowance: conv, medicalAllowance: med, specialAllowance: special, performanceBonus: m === 0 ? Math.round(basic * 0.1) : 0 },
        deductions: { providentFund: pf, employeeStateInsurance: esi, professionalTax: pt, incomeTax: tax },
        grossEarnings: gross, totalDeductions: totalDed, netSalary: net,
        status: m === 0 ? 'processed' : 'paid',
        paymentDetails: { method: 'bank_transfer', paidAt: monthEnd(year, month) },
        attendanceSummary: { totalWorkingDays: 22, presentDays: randInt(19, 22), absentDays: randInt(0, 2), leaveDays: randInt(0, 1) },
      });
    }
  }
  await Payroll.insertMany(payrollRecords);
  console.log(`   ✅ ${payrollRecords.length} payroll records created`);

  // ── 6. Leaves ────────────────────────────────────────────────────────────────
  console.log('🏖️  Seeding leave records...');
  const leaveTypes = ['annual', 'sick', 'casual', 'annual', 'sick'];
  const leaveReasons = [
    'Family vacation', 'Medical appointment', 'Personal work', 'Wedding ceremony',
    'Sick — fever and cold', 'Child care', 'Home renovation', 'Mental health day',
  ];
  const leaveRecords = [];

  for (const user of users) {
    const count = randInt(2, 5);
    for (let i = 0; i < count; i++) {
      const offset = randInt(-60, 30);
      const start  = dateOffset(offset);
      const days   = randInt(1, 4);
      const end    = new Date(start); end.setDate(start.getDate() + days - 1);
      const status = offset < -5 ? rand(['approved','approved','rejected']) : offset > 5 ? 'pending' : 'approved';

      leaveRecords.push({
        employee: user._id,
        leaveType: rand(leaveTypes),
        reason: rand(leaveReasons),
        startDate: start, endDate: end, totalDays: days,
        status,
        approvedBy: status !== 'pending' ? userMap['admin@demo.com']._id : undefined,
        approvedAt: status !== 'pending' ? new Date() : undefined,
        comments: status === 'rejected' ? 'Insufficient leave balance' : status === 'approved' ? 'Approved. Enjoy your time off!' : undefined,
      });
    }
  }
  await Leave.insertMany(leaveRecords);
  console.log(`   ✅ ${leaveRecords.length} leave records created`);

  // ── 7. Performance Reviews ───────────────────────────────────────────────────
  console.log('🎯 Seeding performance reviews...');
  const reviewPeriods = ['Q2 2025', 'Q3 2025', 'Q4 2025'];
  const perfRecords = [];

  for (const user of users.filter(u => u.role === 'employee')) {
    for (const period of reviewPeriods) {
      const [qtr, yr] = period.split(' ');
      const qNum = parseInt(qtr[1]);
      const startMonth = (qNum - 1) * 3 + 1;
      const scores = {
        technical:     { score: randInt(3, 5), comments: rand(['Excellent technical skills', 'Good progress', 'Meets expectations', 'Outstanding performance']) },
        communication: { score: randInt(3, 5), comments: rand(['Clear communicator', 'Room for improvement', 'Very articulate', 'Effective in meetings']) },
        teamwork:      { score: randInt(3, 5), comments: rand(['Great team player', 'Collaborative', 'Helps others proactively', 'Could engage more']) },
        leadership:    { score: randInt(2, 5), comments: rand(['Shows leadership potential', 'Leads by example', 'Taking more ownership', 'Early stage']) },
        productivity:  { score: randInt(3, 5), comments: rand(['Consistently delivers on time', 'High output', 'Meets deadlines', 'Exceeds targets']) },
      };
      const avg = parseFloat((Object.values(scores).reduce((s, v) => s + v.score, 0) / 5).toFixed(1));

      perfRecords.push({
        employee: user._id,
        reviewer: userMap['manager@demo.com']._id,
        reviewCycle: { type: 'quarterly', period, startDate: new Date(parseInt(yr), startMonth - 1, 1), endDate: new Date(parseInt(yr), startMonth + 2, 0) },
        ratings: scores,
        overallRating: avg,
        strengths: [rand(['Problem solving', 'Initiative', 'Technical depth', 'Communication', 'Reliability'])],
        areasOfImprovement: [rand(['Documentation', 'Time management', 'Cross-team collaboration', 'Public speaking'])],
        managerComments: `${user.firstName} has demonstrated consistent performance this ${qtr}. Keep up the great work.`,
        status: 'completed',
        aiInsights: {
          summary: `${user.firstName} shows ${avg >= 4.5 ? 'exceptional' : avg >= 4 ? 'strong' : 'solid'} performance with an overall rating of ${avg}/5.`,
          recommendations: [
            avg < 4 ? 'Consider enrolling in skill enhancement programs' : 'On track for promotion consideration',
            'Regular 1:1 sessions recommended for continued growth',
          ],
        },
      });
    }
  }
  await Performance.insertMany(perfRecords);
  console.log(`   ✅ ${perfRecords.length} performance reviews created`);

  // ── 8. Jobs ─────────────────────────────────────────────────────────────────
  console.log('💼 Seeding job listings...');
  const jobsData = [
    {
      title: 'Senior Full Stack Developer', department: deptMap['ENG'],
      description: 'We are looking for an experienced Full Stack Developer to join our growing engineering team.',
      requirements: ['5+ years experience', 'React & Node.js expertise', 'MongoDB experience', 'AWS knowledge'],
      skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'TypeScript'],
      experience: { min: 5, max: 9 }, salary: { min: 90000, max: 130000 },
      location: 'New York / Remote', workType: 'full_time', workMode: 'hybrid',
      openings: 2, closingDate: dateOffset(30), status: 'open',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: true, applicationCount: 14,
    },
    {
      title: 'Product Manager', department: deptMap['PRD'],
      description: 'Lead product strategy and roadmap for our core platform.',
      requirements: ['3+ years in product management', 'Agile experience', 'Strong analytical skills'],
      skills: ['Agile', 'Jira', 'Roadmapping', 'User Research', 'OKRs'],
      experience: { min: 3, max: 7 }, salary: { min: 80000, max: 110000 },
      location: 'San Francisco', workType: 'full_time', workMode: 'office',
      openings: 1, closingDate: dateOffset(21), status: 'open',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: true, applicationCount: 9,
    },
    {
      title: 'HR Generalist', department: deptMap['HR'],
      description: 'Support HR operations including recruitment, onboarding, and employee engagement.',
      requirements: ['2+ years HR experience', 'Knowledge of labor laws', 'Excellent interpersonal skills'],
      skills: ['Recruitment', 'HRIS', 'Employee Relations', 'Compliance'],
      experience: { min: 2, max: 5 }, salary: { min: 50000, max: 70000 },
      location: 'Austin, TX', workType: 'full_time', workMode: 'office',
      openings: 1, closingDate: dateOffset(15), status: 'open',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: true, applicationCount: 22,
    },
    {
      title: 'Sales Development Representative', department: deptMap['SLS'],
      description: 'Drive outbound sales efforts and build pipeline for the sales team.',
      requirements: ['1+ year in SDR/BDR role', 'Strong communication', 'CRM experience'],
      skills: ['Salesforce', 'Cold Outreach', 'B2B Sales', 'Pipeline Management'],
      experience: { min: 1, max: 3 }, salary: { min: 45000, max: 60000 },
      location: 'Chicago', workType: 'full_time', workMode: 'hybrid',
      openings: 3, closingDate: dateOffset(45), status: 'open',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: true, applicationCount: 31,
    },
    {
      title: 'DevOps Engineer', department: deptMap['ENG'],
      description: 'Own and scale our cloud infrastructure and CI/CD pipelines.',
      requirements: ['4+ years DevOps', 'Kubernetes & Docker', 'AWS/GCP expertise', 'Strong scripting skills'],
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
      experience: { min: 4, max: 8 }, salary: { min: 95000, max: 130000 },
      location: 'Remote', workType: 'full_time', workMode: 'remote',
      openings: 1, closingDate: dateOffset(60), status: 'open',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: true, applicationCount: 7,
    },
    {
      title: 'UI/UX Designer', department: deptMap['DSN'],
      description: 'Create beautiful, user-centric designs for our web and mobile products.',
      requirements: ['3+ years UI/UX', 'Figma proficiency', 'Portfolio required'],
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      experience: { min: 3, max: 6 }, salary: { min: 70000, max: 95000 },
      location: 'New York', workType: 'full_time', workMode: 'hybrid',
      openings: 1, closingDate: dateOffset(0), status: 'closed',
      postedBy: userMap['hr@demo.com']._id, aiScreeningEnabled: false, applicationCount: 18,
    },
  ];
  const jobs = await Job.insertMany(jobsData);
  console.log(`   ✅ ${jobs.length} jobs created`);

  // ── 9. Applications ──────────────────────────────────────────────────────────
  console.log('📋 Seeding job applications...');
  const stages = ['applied','ai_screening','shortlisted','hr_interview','technical_interview','offer_sent','hired','rejected'];
  const firstNames = ['Arjun','Zoe','Rohan','Mei','David','Nina','Carlos','Amelia','Ravi','Sophie','Andre','Fatima','Jake','Yuki','Omar'];
  const lastNames  = ['Mehta','Laurent','Gupta','Zhang','Osei','Patel','Fuentes','Brooks','Kumar','Martin','Silva','Hassan','Torres','Tanaka','Al-Farsi'];
  const companies  = ['Google','Microsoft','Amazon','Infosys','TCS','Wipro','Accenture','IBM','Deloitte','Meta'];
  const positions  = ['Software Engineer','Developer','Analyst','Manager','Specialist','Consultant','Lead','Associate'];
  const sources    = ['linkedin','portal','referral','naukri','agency'];

  const appRecords = [];
  for (const job of jobs.slice(0, 5)) {
    const count = randInt(6, 12);
    for (let i = 0; i < count; i++) {
      const score = randInt(42, 97);
      const rec   = score >= 80 ? 'strong_yes' : score >= 65 ? 'yes' : score >= 50 ? 'maybe' : 'no';
      const stage = score >= 80
        ? rand(['shortlisted','hr_interview','technical_interview','offer_sent','hired'])
        : score >= 65
        ? rand(['shortlisted','hr_interview','rejected'])
        : rand(['ai_screening','applied','rejected']);

      appRecords.push({
        job: job._id,
        candidate: {
          firstName: rand(firstNames), lastName: rand(lastNames),
          email: `candidate${appRecords.length + 1}@email.com`,
          phone: `+1-555-${String(randInt(1000,9999))}`,
          currentPosition: rand(positions),
          currentCompany: rand(companies),
          totalExperience: randInt(1, 10),
          expectedSalary: randInt(60000, 140000),
        },
        resumeUrl: 'uploads/resumes/sample-resume.pdf',
        stage,
        source: rand(sources),
        aiScreening: {
          score,
          summary: `Candidate demonstrates ${score >= 80 ? 'excellent' : score >= 65 ? 'good' : 'partial'} alignment with the ${job.title} role. ${score >= 80 ? 'Strong technical background with relevant project experience.' : score >= 65 ? 'Meets core requirements with some gaps in desired skills.' : 'Limited experience in key required areas.'}`,
          strengths: rand([['Strong communication','Relevant tech stack','Good portfolio'],['Leadership experience','Problem-solving skills','Team collaboration'],['Fast learner','Attention to detail','Industry knowledge']]),
          weaknesses: rand([['Limited cloud experience'],['No management experience'],['Needs more domain expertise']]),
          recommendation: rec,
          processedAt: new Date(),
        },
      });
    }
  }
  await Application.insertMany(appRecords);
  console.log(`   ✅ ${appRecords.length} applications created`);

  // ── 10. Notifications ────────────────────────────────────────────────────────
  console.log('🔔 Seeding notifications...');
  const notifData = [];
  for (const user of users) {
    notifData.push(
      { user: user._id, title: 'Welcome!',           message: `Welcome to SmartHR Nexus, ${user.firstName}! Your account is ready.`,        type: 'system',   read: true  },
      { user: user._id, title: 'Payslip Ready',      message: `Your payslip for ${now.toLocaleString('default',{month:'long'})} is available.`, type: 'payroll',  read: false },
      { user: user._id, title: 'Performance Review', message: 'Your Q4 performance review has been submitted.',                                type: 'performance', read: false },
    );
    if (user.role === 'admin') {
      notifData.push({ user: user._id, title: 'New Applications', message: '14 new applications received for Senior Developer role.', type: 'recruitment', read: false });
      notifData.push({ user: user._id, title: 'Payroll Due',      message: 'Monthly payroll processing is due in 3 days.',           type: 'payroll',     read: false });
    }
    if (user.role === 'senior_manager') {
      notifData.push({ user: user._id, title: 'Leave Requests',   message: '3 leave requests pending your approval.',               type: 'leave',       read: false });
    }
    if (user.role === 'hr_recruiter') {
      notifData.push({ user: user._id, title: 'AI Screening Done', message: '9 resumes auto-screened for Product Manager role.',    type: 'recruitment', read: false });
    }
  }
  await Notification.insertMany(notifData);
  console.log(`   ✅ ${notifData.length} notifications created`);

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  console.log('🎉 Seeding complete!\n');
  console.log('📊 Database Summary:');
  console.log(`   Departments:       ${departments.length}`);
  console.log(`   Users:             ${users.length}`);
  console.log(`   Employee Profiles: ${empProfiles.length}`);
  console.log(`   Attendance:        ${attendanceRecords.length}`);
  console.log(`   Payroll Records:   ${payrollRecords.length}`);
  console.log(`   Leave Records:     ${leaveRecords.length}`);
  console.log(`   Perf Reviews:      ${perfRecords.length}`);
  console.log(`   Jobs:              ${jobs.length}`);
  console.log(`   Applications:      ${appRecords.length}`);
  console.log(`   Notifications:     ${notifData.length}`);
  console.log('\n🔑 Demo Login Credentials:');
  console.log('   ┌─────────────────┬──────────────────────────┬───────────────┐');
  console.log('   │ Role            │ Email                    │ Password      │');
  console.log('   ├─────────────────┼──────────────────────────┼───────────────┤');
  console.log('   │ Admin           │ admin@demo.com           │ Admin@1234    │');
  console.log('   │ Senior Manager  │ manager@demo.com         │ Manager@1234  │');
  console.log('   │ HR Recruiter    │ hr@demo.com              │ HR@1234       │');
  console.log('   │ Employee        │ employee@demo.com        │ Employee@1234 │');
  console.log('   └─────────────────┴──────────────────────────┴───────────────┘\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeder failed:', err.message);
  process.exit(1);
});
