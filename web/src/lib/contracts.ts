export type UUID = string;
export type ISODate = string;
export type ISODateTime = string;

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details: ErrorDetail[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: ErrorResponse | null;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageParams {
  page?: number;
  size?: number;
}

export type VehicleStatus = "DISPONIVEL" | "INDISPONIVEL" | "EM_MANUTENCAO" | "ABATIDA";
export type DriverStatus = "ATIVO" | "INATIVO" | "SUSPENSO";
export type ActivityStatus = "PLANEADA" | "EM_CURSO" | "SUSPENSA" | "CONCLUIDA" | "CANCELADA";
export type ActivityPriority = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
export type AlertSeverity = "INFO" | "AVISO" | "CRITICO";
export type AlertType = "DOCUMENT_EXPIRY" | "DOCUMENT_EXPIRED" | "MAINTENANCE_DUE" | "MAINTENANCE_OVERDUE" | "ALLOCATION_CONFLICT";
export type AuditOperation = "CRIACAO" | "ATUALIZACAO" | "ELIMINACAO" | "LEITURA";
export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "TERMINATED";
export type SalaryPaymentStatus = "PAID" | "CANCELLED";
export type PaymentMethod = "BANK_TRANSFER" | "CASH" | "MOBILE_MONEY" | "OTHER";
export type PaymentStatusFilter = "PAID" | "UNPAID" | "ALL";
export type DocumentStatus = "VALIDO" | "EXPIRADO" | "PENDENTE_RENOVACAO" | "CANCELADO";
export type CatalogCategory = "VEHICLE_DOCUMENT" | "DRIVER_DOCUMENT" | "ACCESSORY" | "ACTIVITY_TYPE";
export type VehicleDocumentType = string;
export type DriverDocumentType = string;
export type MaintenanceType = "PREVENTIVA" | "CORRETIVA";
export type ChecklistItemStatus = "OK" | "AVARIA" | "FALTA";
export type AccessoryStatus = "PRESENTE" | "AUSENTE" | "DANIFICADO";
export type AccessoryType = string;

export interface CatalogItemDto {
  id: UUID;
  category: CatalogCategory;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  systemDefault: boolean;
  sortOrder: number;
}

export interface CatalogItemCreateDto {
  category: CatalogCategory;
  code: string;
  name: string;
  description?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface CatalogItemUpdateDto {
  name: string;
  description?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface VehicleAccessoryCreateDto {
  accessoryType: AccessoryType;
  status?: AccessoryStatus;
  notes?: string;
}

export interface VehicleAccessoryDto extends VehicleAccessoryCreateDto {
  id: UUID;
  lastCheckedAt?: ISODateTime;
  lastCheckedBy?: string;
}

export interface VehicleCreateDto {
  plate: string;
  brand: string;
  model: string;
  vehicleType: string;
  capacity: number;
  activityLocation: string;
  activityStartDate: ISODate;
  notes?: string;
  accessories?: VehicleAccessoryCreateDto[];
}

export type VehicleUpdateDto = Omit<VehicleCreateDto, "plate" | "accessories">;

export interface VehicleResponseDto extends VehicleCreateDto {
  id: UUID;
  status: VehicleStatus;
  currentDriverId?: UUID;
  createdAt?: ISODateTime;
  accessories?: VehicleAccessoryDto[];
}

export interface VehicleDocumentDto {
  id?: UUID;
  documentType: VehicleDocumentType;
  documentNumber?: string;
  issueDate?: ISODate;
  expiryDate?: ISODate;
  issuingEntity?: string;
  status?: DocumentStatus;
  notes?: string;
  fileId?: UUID;
}

export interface MaintenanceRecordDto {
  id?: UUID;
  maintenanceType: MaintenanceType;
  performedAt: ISODate;
  mileageAtService?: number;
  description?: string;
  supplier?: string;
  totalCost?: number;
  partsReplaced?: string;
  nextMaintenanceDate?: ISODate;
  nextMaintenanceMileage?: number;
  responsibleUser?: string;
}

export interface ChecklistInspectionItemDto {
  templateItemId?: UUID;
  itemName: string;
  critical: boolean;
  status: ChecklistItemStatus;
  notes?: string;
}

export interface ChecklistInspectionDto {
  id?: UUID;
  activityId?: UUID;
  templateId?: UUID;
  performedBy?: string;
  performedAt?: ISODateTime;
  notes?: string;
  items: ChecklistInspectionItemDto[];
  criticalFailures: boolean;
}

export interface ChecklistTemplateItemDto {
  id?: UUID;
  itemName: string;
  critical: boolean;
  displayOrder?: number;
}

export interface ChecklistTemplateDto {
  id?: UUID;
  vehicleType?: string;
  name: string;
  active: boolean;
  items: ChecklistTemplateItemDto[];
}

export interface VehicleConsolidatedDto {
  vehicle: VehicleResponseDto;
  documents: VehicleDocumentDto[];
  accessories: VehicleAccessoryDto[];
  maintenanceRecords: MaintenanceRecordDto[];
  checklists: ChecklistInspectionDto[];
  activeActivities: ActivitySummaryDto[];
  activeAlerts: AlertSummaryDto[];
}

export interface DriverCreateDto {
  fullName: string;
  phone: string;
  address: string;
  idNumber: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseIssueDate: ISODate;
  licenseExpiryDate: ISODate;
  activityLocation: string;
  status?: DriverStatus;
  employeeId?: UUID;
  notes?: string;
}

export interface DriverResponseDto extends DriverCreateDto {
  id: UUID;
  status: DriverStatus;
}

export interface DriverDocumentDto {
  id?: UUID;
  documentType: DriverDocumentType;
  documentNumber?: string;
  issueDate?: ISODate;
  expiryDate?: ISODate;
  issuingEntity?: string;
  category?: string;
  status?: DocumentStatus;
  notes?: string;
  fileId?: UUID;
}

export interface EmployeeAbsenceDto {
  startDate: ISODate;
  endDate: ISODate;
  reason: string;
}

export interface DriverAvailabilityDto {
  driverId: UUID;
  available: boolean;
  reason?: string;
  absences: EmployeeAbsenceDto[];
}

export interface ActivityCreateDto {
  title: string;
  activityType: string;
  location: string;
  plannedStart: ISODateTime;
  plannedEnd: ISODateTime;
  priority: ActivityPriority;
  description?: string;
  notes?: string;
}

export interface ActivityResponseDto extends ActivityCreateDto {
  id: UUID;
  code: string;
  actualStart?: ISODateTime;
  actualEnd?: ISODateTime;
  status: ActivityStatus;
  vehicleId?: UUID;
  driverId?: UUID;
  rhOverrideJustification?: string;
}

export interface AllocationRequestDto {
  vehicleId: UUID;
  driverId: UUID;
  plannedStart: ISODateTime;
  plannedEnd: ISODateTime;
  rhOverrideJustification?: string;
}

export interface StatusTransitionDto {
  status: ActivityStatus;
  notes?: string;
}

export interface ActivityEventDto {
  id: UUID;
  eventType: string;
  previousStatus?: string;
  newStatus?: string;
  performedBy?: string;
  performedAt: ISODateTime;
  notes?: string;
}

export interface ActivitySummaryDto {
  id: UUID;
  code: string;
  title: string;
  status: string;
  plannedStart?: ISODateTime;
  plannedEnd?: ISODateTime;
}

export interface AlertResponseDto {
  id: UUID;
  alertType: AlertType;
  severity: AlertSeverity;
  entityType: string;
  entityId: UUID;
  title: string;
  message: string;
  resolved: boolean;
  resolvedAt?: ISODateTime;
  resolvedBy?: string;
  createdAt: ISODateTime;
}

export interface AlertSummaryDto {
  id: UUID;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  createdAt: ISODateTime;
}

export interface AlertConfigurationDto {
  id: UUID;
  alertType: AlertType;
  entityType: string;
  daysBeforeWarning?: number;
  daysBeforeCritical?: number;
  active: boolean;
}

export interface AlertConfigurationUpdateDto {
  daysBeforeWarning?: number;
  daysBeforeCritical?: number;
  active?: boolean;
}

export interface AuditLogResponseDto {
  id: UUID;
  entityType: string;
  entityId: UUID;
  operation: AuditOperation;
  performedBy: string;
  ipAddress?: string;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  occurredAt: ISODateTime;
}

export interface EmployeeCreateDto {
  employeeNumber: string;
  fullName: string;
  phone?: string;
  email?: string;
  idNumber?: string;
  functionId?: UUID;
  status?: EmployeeStatus;
  hireDate?: ISODate;
  terminationDate?: ISODate;
  baseSalary?: number;
  currency?: string;
  notes?: string;
}

export interface EmployeeResponseDto extends EmployeeCreateDto {
  id: UUID;
  functionName?: string;
  status: EmployeeStatus;
}

export interface EmployeeFunctionCreateDto {
  code: string;
  name: string;
  description?: string;
}

export interface EmployeeFunctionResponseDto extends EmployeeFunctionCreateDto {
  id: UUID;
  active: boolean;
}

export interface SalaryPaymentCreateDto {
  employeeId: UUID;
  periodYear: number;
  periodMonth: number;
  grossAmount: number;
  netAmount: number;
  paidAmount: number;
  currency?: string;
  paymentDate: ISODate;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface SalaryPaymentResponseDto extends SalaryPaymentCreateDto {
  id: UUID;
  status: SalaryPaymentStatus;
}

export interface EmployeePaymentStatusDto {
  employeeId: UUID;
  employeeNumber: string;
  fullName: string;
  functionName?: string;
  periodYear: number;
  periodMonth: number;
  paymentStatus: string;
  paidAmount?: number;
  paymentDate?: ISODate;
  paymentReference?: string;
}

export interface UserCreateDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  enabled: boolean;
}

export interface UserResponseDto extends UserCreateDto {
  id: string;
  createdAt?: ISODateTime;
}

export interface FileUploadResultDto {
  fileId: UUID;
  originalFilename: string;
  storageKey: string;
  contentType: string;
  sizeBytes: number;
}
