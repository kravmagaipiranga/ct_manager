export type Role = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
export type Belt = 'WHITE' | 'YELLOW' | 'ORANGE' | 'GREEN' | 'BLUE' | 'BROWN' | 'BLACK';
export type Status = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'OVERDUE';
export type CheckinStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED';
export type FinancialStatus = 'PAID' | 'PENDING' | 'OVERDUE';
export type EventType = 'SEMINAR' | 'WORKSHOP' | 'EXAM';

export interface AcademySettings {
  id: string;
  systemName: string;
  academyName: string;
  cnpj?: string;
  pixKey?: string;
  address?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  whatsappMessages: {
    birthday: string;
    inactive: string;
  };
}

export interface Address {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface User {
  id: string;
  academyId: string;
  role: Role;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  beltLevel?: Belt;
  enrollmentStatus?: Status;
  financialStatus?: Status;
  createdAt: string;

  // Novos campos do formulário de matrícula (Jotform)
  cpf?: string;
  birthDate?: string;
  shirtSize?: string;
  pantsSize?: string;
  emergencyContact?: EmergencyContact;
  
  // Relacionamento com o instrutor (alunos podem ser delegados a um instrutor)
  instructorId?: string;
  
  // Controle de graduação
  lastExamDate?: string;
}

export type VisitType = 'TRIAL' | 'VISIT';

export interface Visit {
  id: string;
  type: VisitType;
  date: string;
  studentName: string;
  phone?: string;
  instructorId: string;
}

export interface ClassSession {
  id: string;
  name: string;
  instructorId: string;
  instructorName: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, etc.
  time: string; // e.g. "19:00"
  durationMinutes: number; // e.g. 60, 90
  allowedBelts?: Belt[];
  otherModalities?: string[];
}

export interface Checkin {
  id: string;
  studentId: string;
  classId: string;
  timestamp: string;
  status: CheckinStatus;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  variations?: string[]; // comma-separated strings of variations or just array
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  variation?: string;
}

export interface Order {
  id: string;
  studentId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  studentId: string;
  referenceMonth: string; // e.g. "Maio/2026"
  amount: number;
  dueDate: string;
  status: FinancialStatus;
  paidAt?: string;
}

export interface CurriculumTechnique {
  id: string;
  belt: Belt;
  category: string;
  name: string;
  description: string;
  videoUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  isPinned: boolean;
  createdAt: string;
}

export type AppointmentType = 'PRIVATE_CLASS' | 'LECTURE' | 'WORKSHOP';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Appointment {
  id: string;
  type: AppointmentType;
  title: string;
  date: string;
  durationMinutes: number;
  instructorId: string;
  instructorName: string;
  
  // Who is paying for / attending the appointment?
  isExternalClient: boolean;
  studentId?: string; // If internal student
  externalClientName?: string; // If external (e.g., student not in DB, enterprise)
  externalClientDocument?: string; // e.g. CNPJ or CPF
  externalClientPhone?: string;

  price: number;
  status: AppointmentStatus;
  notes?: string;
}

export interface AcademyEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  description: string;
  capacity: number;
  price?: number;
  registeredCount: number;
  allowedStudentIds?: string[]; // IDs containing students allowed to register (mostly used for exams)
}

export interface ClassLog {
  id: string;
  dateStr: string; // "YYYY-MM-DD"
  classId: string;
  belt: Belt;
  techniques: string[]; // array of lines from curriculumTexts
}



