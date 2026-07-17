export type MongoId = string
export type ISODateString = string

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'sales' | 'viewer'

export interface LoginPayload {
  email: string
  password: string
}

export interface UserPayload {
  email: string
  password?: string
  name: string
  role?: UserRole
  location?: string
  branch?: MongoId
  isActive?: boolean
  fcmToken?: string
  fcmTokens?: string[]
}

export interface Location {
  idLocation: MongoId
  location: string
  description?: string
  branches?: Branch[]
}

export interface Branch {
  _id?: MongoId
  id?: MongoId
  code: string
  name: string
  city?: string
  address?: string
  phone?: string
  location?: Location | MongoId | null
  targetRevenue: number
  isActive: boolean
  createdAt?: ISODateString
  updatedAt?: ISODateString
}

export interface BranchPayload {
  code: string
  name: string
  city?: string
  address?: string
  phone?: string
  location: MongoId
  targetRevenue?: number
  isActive?: boolean
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'

export interface LeadPayload {
  name: string
  phone?: string
  source?: string
  notes?: string
  message?: string
  branch?: string
  branchRef?: MongoId
  location?: string
  status?: LeadStatus
  estimatedValue?: number
  lostReason?: string
  customer?: MongoId
  assignedUser?: MongoId
}

export interface CustomerPayload {
  name: string
  company?: string
  email?: string
  phone: string
  address?: string
  city?: string
  branch?: MongoId
  owner?: MongoId
  source?: string
  notes?: string
  isActive?: boolean
}

export type QuotationStatus = 'draft' | 'sent' | 'viewed' | 'negotiation' | 'accepted' | 'rejected' | 'expired'

export interface QuotationItemPayload {
  product?: MongoId
  name: string
  sku?: string
  quantity: number
  unitPrice: number
  discount?: number
}

export interface QuotationPayload {
  number: string
  customer: MongoId
  lead?: MongoId
  branch: MongoId
  sales?: MongoId
  items: QuotationItemPayload[]
  discount?: number
  tax?: number
  status?: QuotationStatus
  validUntil?: string
  notes?: string
}
