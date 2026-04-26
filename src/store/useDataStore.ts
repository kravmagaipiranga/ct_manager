import { create } from 'zustand';
import { User, ClassSession, Checkin, Product, Order, FinancialRecord, OrderStatus, CurriculumTechnique, Announcement, AcademyEvent, AcademySettings, Appointment, AppointmentStatus, ClassLog, Belt, Visit, VisitType } from '../types';

export interface DataState {
  academiesSettings: AcademySettings[];
  students: User[];
  classes: ClassSession[];
  checkins: Checkin[];
  products: Product[];
  orders: Order[];
  financials: FinancialRecord[];
  techniques: CurriculumTechnique[];
  announcements: Announcement[];
  events: AcademyEvent[];
  appointments: Appointment[]; // New Field
  classLogs: ClassLog[];
  visits: Visit[];
  
  // existing actions
  updateAcademySettings: (academyId: string, newSettings: Partial<AcademySettings>) => void;
  requestCheckin: (studentId: string, classId: string) => void;
  approveCheckin: (checkinId: string) => void;
  rejectCheckin: (checkinId: string) => void;
  
  // update existing actions
  addStudent: (student: Omit<User, 'id' | 'createdAt'>) => void;
  updateStudent: (id: string, updates: Partial<User>) => void;
  deleteStudent: (id: string) => void;
  updateClass: (id: string, updates: Partial<ClassSession>) => void;
  updateEvent: (id: string, updates: Partial<AcademyEvent>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteEvent: (id: string) => void;
  deleteAppointment: (id: string) => void;
  
  // store CRUD
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // phase 4 actions
  placeOrder: (studentId: string, items: { productId: string; quantity: number }[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markFinancialPaid: (recordId: string) => void;

  // phase 5 actions
  registerForEvent: (eventId: string, studentId: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  addEvent: (event: Omit<AcademyEvent, 'id' | 'registeredCount'>) => void;
  
  // Add Appointment
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  
  // phase 5 extension
  curriculumTexts: Record<string, string>;
  updateCurriculumText: (belt: string, content: string) => void;

  // Class Logs
  addClassLog: (log: Omit<ClassLog, 'id'>) => void;

  // Visits
  addVisit: (visit: Omit<Visit, 'id'>) => void;

  // System Backup & Recovery
  importBackup: (backupData: any) => void;
}

// ... keeping existing mocks untouched
const MOCK_STUDENTS: User[] = [
  ...[
    // Admin Ipiranga
    { id: 'admin_ipiranga', academyId: 'ipiranga', role: 'ADMIN', name: 'Alon (Ipiranga)', email: 'kravmagaipiranga@gmail.com', password: 'admin', phone: '(11) 99999-0001', createdAt: '2026-01-01' },
    // Admin Santo Amaro
    { id: 'admin_santo_amaro', academyId: 'santo_amaro', role: 'ADMIN', name: 'Celso (Santo Amaro)', email: 'celso@kravmaga.org.br', password: 'admin', phone: '(11) 99999-0002', createdAt: '2026-01-01' },
    
    // Instructor Thiago (Ipiranga)
    { id: 'instructor_thiago', academyId: 'ipiranga', role: 'INSTRUCTOR', name: 'Thiago', email: 'thiago@kravmaga.org.br', password: '123', phone: '(11) 98888-5555', beltLevel: 'BLACK', enrollmentStatus: 'ACTIVE', createdAt: '2026-01-01' },
  ] as User[]
];

const MOCK_CLASSES: ClassSession[] = [];

const MOCK_PRODUCTS: Product[] = [];

const MOCK_FINANCIALS: FinancialRecord[] = [];

const MOCK_ORDERS: Order[] = [];

// Phase 5 Mocks
const MOCK_TECHNIQUES: CurriculumTechnique[] = [];

const MOCK_ANNOUNCEMENTS: Announcement[] = [];

const MOCK_EVENTS: AcademyEvent[] = [];

const MOCK_APPOINTMENTS: Appointment[] = [];

export const useDataStore = create<DataState>((set, get) => ({
  academiesSettings: [
    {
      id: 'ipiranga',
      systemName: 'Portal Ipiranga',
      academyName: 'Krav Maga Ipiranga',
      cnpj: '',
      pixKey: '',
      address: 'Rua Agostinho Gomes, 2197',
      whatsapp: '11999990001',
      email: 'kravmagaipiranga@gmail.com',
      website: '',
      logoUrl: '',
      whatsappMessages: {
        birthday: 'Parabéns {nome}, felicidades da equipe Ipiranga!',
        inactive: 'Sentimos sua falta no Ipiranga, {nome}!'
      }
    },
    {
      id: 'santo_amaro',
      systemName: 'Portal Santo Amaro',
      academyName: 'Krav Maga Santo Amaro',
      cnpj: '',
      pixKey: '',
      address: 'Av. Santo Amaro, 1234',
      whatsapp: '11999990002',
      email: 'celso@kravmaga.org.br',
      website: '',
      logoUrl: '',
      whatsappMessages: {
        birthday: 'Parabéns {nome}, felicidades da equipe Santo Amaro!',
        inactive: 'Sentimos sua falta em Santo Amaro, {nome}!'
      }
    }
  ],
  students: MOCK_STUDENTS,
  classes: MOCK_CLASSES,
  checkins: [],
  products: MOCK_PRODUCTS,
  orders: MOCK_ORDERS,
  financials: MOCK_FINANCIALS,
  techniques: MOCK_TECHNIQUES,
  announcements: MOCK_ANNOUNCEMENTS,
  events: MOCK_EVENTS,
  appointments: MOCK_APPOINTMENTS,
  visits: [],
  
  updateAcademySettings: (academyId, newSettings) => set((state) => ({
    academiesSettings: state.academiesSettings.map(s => s.id === academyId ? { ...s, ...newSettings } : s)
  })),

  // Global editability & creation
  addStudent: (studentData) => set((state) => {
    const newStudent = {
      ...studentData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    } as User;
    return { students: [...state.students, newStudent] };
  }),
  updateStudent: (id, updates) => set((state) => ({
    students: state.students.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  deleteStudent: (id) => set((state) => ({
    students: state.students.filter(s => s.id !== id)
  })),
  updateClass: (id, updates) => set((state) => ({
    classes: state.classes.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  updateEvent: (id, updates) => set((state) => ({
    events: state.events.map(e => e.id === id ? { ...e, ...updates } : e)
  })),
  updateAppointment: (id, updates) => set((state) => ({
    appointments: state.appointments.map(a => a.id === id ? { ...a, ...updates } : a)
  })),
  deleteEvent: (id) => set((state) => ({
    events: state.events.filter(e => e.id !== id)
  })),
  deleteAppointment: (id) => set((state) => ({
    appointments: state.appointments.filter(a => a.id !== id)
  })),

  requestCheckin: (studentId, classId) => set((state) => ({
    checkins: [...state.checkins, {
      id: Math.random().toString(36).substr(2, 9),
      studentId,
      classId,
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    }]
  })),
  approveCheckin: (checkinId) => set((state) => ({
    checkins: state.checkins.map(chk => chk.id === checkinId ? { ...chk, status: 'APPROVED' } : chk)
  })),
  rejectCheckin: (checkinId) => set((state) => ({
    checkins: state.checkins.map(chk => chk.id === checkinId ? { ...chk, status: 'REJECTED' } : chk)
  })),

  addProduct: (product) => set((state) => ({
    products: [{ ...product, id: Math.random().toString(36).substr(2, 9) }, ...state.products]
  })),

  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),

  placeOrder: (studentId, reqItems) => set((state) => {
    let total = 0;
    const items = reqItems.map(item => {
      const product = state.products.find(p => p.id === item.productId);
      const price = product?.price || 0;
      total += price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, unitPrice: price };
    });

    return {
      orders: [{
        id: Math.random().toString(36).substr(2, 9),
        studentId,
        items,
        total,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }, ...state.orders]
    };
  }),

  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(o => o.id === orderId ? { ...o, status } : o)
  })),

  markFinancialPaid: (recordId) => set((state) => ({
    financials: state.financials.map(f => f.id === recordId ? { ...f, status: 'PAID', paidAt: new Date().toISOString() } : f)
  })),

  registerForEvent: (eventId, studentId) => set((state) => ({
    events: state.events.map(e => e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e)
  })),

  addAnnouncement: (announcement) => set((state) => ({
    announcements: [
      { ...announcement, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() },
      ...state.announcements
    ]
  })),

  addEvent: (event) => set((state) => ({
    events: [
      { ...event, id: Math.random().toString(36).substr(2, 9), registeredCount: 0 },
      ...state.events
    ]
  })),

  addAppointment: (appointment) => set((state) => ({
    appointments: [
      { ...appointment, id: Math.random().toString(36).substr(2, 9) },
      ...state.appointments
    ]
  })),

  updateAppointmentStatus: (id, status) => set((state) => ({
    appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a)
  })),

  curriculumTexts: {
    'WHITE': 'Bases Essenciais\nMovimentação 360º\nDefesas Pessoais Iniciais\nAtaques Rápidos',
    'YELLOW': 'Saídas de Pegadas\nDefesas contra Facas Nível 1\nChutes Baixos'
  },
  
  updateCurriculumText: (belt, content) => set((state) => ({
    curriculumTexts: { ...state.curriculumTexts, [belt]: content }
  })),

  classLogs: [
    {
      id: 'log1',
      dateStr: (() => {
        const dt = new Date();
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      })(),
      classId: 'c1', // Assuming c1 is valid for today (modify if needed)
      belt: 'WHITE',
      techniques: ['Bases Essenciais', 'Movimentação 360º']
    }
  ],

  addClassLog: (log) => set((state) => ({
    classLogs: [...state.classLogs, { ...log, id: Math.random().toString(36).substr(2, 9) }]
  })),

  addVisit: (visit) => set((state) => ({
    visits: [{ ...visit, id: Math.random().toString(36).substr(2, 9) }, ...state.visits]
  })),

  importBackup: (backupData) => set((state) => {
    const validKeys = [
      'settings', 'students', 'classes', 'checkins', 'products',
      'orders', 'financials', 'techniques', 'announcements',
      'events', 'appointments', 'curriculumTexts', 'classLogs'
    ];
    const newState = { ...state };
    validKeys.forEach((key) => {
      if (backupData[key] !== undefined) {
        (newState as any)[key] = backupData[key];
      }
    });
    return newState;
  })
}));



