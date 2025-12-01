export type UserRole = 'ADMIN' | 'ISG_UZMANI' | 'DENETCI';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  groupId?: number | null;
  group?: Group;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  facilities?: Facility[];
  members?: User[];
  _count?: {
    members: number;
  };
}

export interface Facility {
  id: number;
  name: string;
  address?: string;
  city?: string;
  groupId: number;
  group?: Group;
  isActive: boolean;
}

export interface Section {
  id: number;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  categories?: Category[];
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  sectionId: number;
  section?: Section;
  order: number;
  isActive: boolean;
  questions?: Question[];
}

export interface Question {
  id: number;
  text: string;
  twScore: number;
  categoryId: number;
  category?: Category;
  order: number;
  isActive: boolean;
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  questions?: TemplateQuestion[];
}

export interface TemplateQuestion {
  id: number;
  templateId: number;
  questionId: number;
  question: Question;
  order: number;
}

export type AnswerType = 'KARSILYOR' | 'KISMEN_KARSILYOR' | 'KARSILAMIYOR' | 'KAPSAM_DISI';
export type AuditStatus = 'DRAFT' | 'COMPLETED';

export interface Audit {
  id: number;
  facilityId: number;
  facility: Facility;
  templateId: number;
  template: Template;
  userId: number;
  auditor: Partial<User>;
  auditDate: string;
  status: AuditStatus;
  totalScore?: number;
  answers?: AuditAnswer[];
}

export interface AuditAnswer {
  id: number;
  auditId: number;
  questionId: number;
  question: Question;
  answerType: AnswerType;
  explanation?: string;
  photos?: Photo[];
}

export interface Photo {
  id: number;
  auditAnswerId: number;
  filename: string;
  originalName: string;
  path: string;
}

export interface Statistics {
  totalAudits: number;
  averageScore: number;
  scoresByFacility: { [key: string]: number };
  scoresBySection: { [key: string]: number };
  answerDistribution: {
    KARSILYOR: number;
    KISMEN_KARSILYOR: number;
    KARSILAMIYOR: number;
    KAPSAM_DISI: number;
  };
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
