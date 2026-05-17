import { clearSession, ensureValidAccessToken, getAccessToken, refreshAccessToken } from "@/lib/auth";
import type {
  ActivityCreateDto,
  ActivityEventDto,
  ActivityResponseDto,
  AllocationRequestDto,
  AlertConfigurationDto,
  AlertConfigurationUpdateDto,
  AlertResponseDto,
  AlertSeverity,
  ApiResponse,
  AuditLogResponseDto,
  AuditOperation,
  CatalogCategory,
  CatalogItemCreateDto,
  CatalogItemDto,
  CatalogItemUpdateDto,
  ChecklistInspectionDto,
  ChecklistTemplateDto,
  DriverAvailabilityDto,
  DriverCreateDto,
  DriverDocumentDto,
  DriverResponseDto,
  DriverStatus,
  EmployeeCreateDto,
  EmployeeFunctionCreateDto,
  EmployeeFunctionResponseDto,
  EmployeePaymentStatusDto,
  EmployeeResponseDto,
  EmployeeStatus,
  FileUploadResultDto,
  MaintenanceRecordDto,
  PageParams,
  PagedResponse,
  PaymentStatusFilter,
  SalaryPaymentCreateDto,
  SalaryPaymentResponseDto,
  StatusTransitionDto,
  UserCreateDto,
  UserResponseDto,
  UUID,
  VehicleConsolidatedDto,
  VehicleCreateDto,
  VehicleDocumentDto,
  VehicleResponseDto,
  VehicleStatus,
  VehicleUpdateDto,
} from "@/lib/contracts";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details: { field: string; message: string }[] = [],
  ) {
    super(message);
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_TMS_API_BASE_URL ?? "http://localhost:8080/api/v1";

type QueryValue = string | number | boolean | null | undefined;

function toQuery(params?: object) {
  const query = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    const typedValue = value as QueryValue;
    if (typedValue !== undefined && typedValue !== null && typedValue !== "") query.set(key, String(typedValue));
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

async function request<T>(path: string, init: RequestInit = {}) {
  const execute = async (token: string | null) => {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  };

  let token = await ensureValidAccessToken();
  if (!token) token = getAccessToken();
  let response = await execute(token);

  if (response.status === 401) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      response = await execute(refreshedToken);
    } else {
      clearSession();
    }
  }

  if (response.status === 204) return null as T;
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? ((await response.json()) as ApiResponse<T>) : null;

  if (!response.ok || payload?.error) {
    throw new ApiClientError(payload?.error?.message ?? response.statusText, response.status, payload?.error?.code, payload?.error?.details ?? []);
  }

  return payload?.data as T;
}

async function requestBlob(path: string, init: RequestInit = {}) {
  const execute = async (token: string | null) => {
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  };

  let token = await ensureValidAccessToken();
  if (!token) token = getAccessToken();
  let response = await execute(token);

  if (response.status === 401) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      response = await execute(refreshedToken);
    } else {
      clearSession();
    }
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? ((await response.json()) as ApiResponse<unknown>) : null;
    throw new ApiClientError(payload?.error?.message ?? response.statusText, response.status, payload?.error?.code);
  }

  return {
    blob: await response.blob(),
    filename: filenameFromContentDisposition(response.headers.get("content-disposition")),
  };
}

function filenameFromContentDisposition(header: string | null) {
  if (!header) return null;
  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].replace(/^"|"$/g, ""));
  const match = header.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const json = (body?: unknown) => (body === undefined ? undefined : JSON.stringify(body));

export const api = {
  vehicles: {
    list: (params?: PageParams & { status?: VehicleStatus; location?: string }) =>
      request<PagedResponse<VehicleResponseDto>>(`/vehicles${toQuery(params)}`),
    search: (q: string, params?: PageParams) =>
      request<PagedResponse<VehicleResponseDto>>(`/vehicles/search${toQuery({ ...params, q })}`),
    get: (id: UUID) => request<VehicleResponseDto>(`/vehicles/${id}`),
    consolidated: (id: UUID) => request<VehicleConsolidatedDto>(`/vehicles/${id}/consolidated`),
    create: (body: VehicleCreateDto) => request<VehicleResponseDto>("/vehicles", { method: "POST", body: json(body) }),
    update: (id: UUID, body: VehicleUpdateDto) => request<VehicleResponseDto>(`/vehicles/${id}`, { method: "PUT", body: json(body) }),
    updateStatus: (id: UUID, status: VehicleStatus) => request<VehicleResponseDto>(`/vehicles/${id}/status`, { method: "PATCH", body: json({ status }) }),
    delete: (id: UUID) => request<void>(`/vehicles/${id}`, { method: "DELETE" }),
    documents: {
      list: (id: UUID) => request<VehicleDocumentDto[]>(`/vehicles/${id}/documents`),
      create: (id: UUID, body: VehicleDocumentDto) => request<VehicleDocumentDto>(`/vehicles/${id}/documents`, { method: "POST", body: json(body) }),
      update: (id: UUID, docId: UUID, body: VehicleDocumentDto) => request<VehicleDocumentDto>(`/vehicles/${id}/documents/${docId}`, { method: "PUT", body: json(body) }),
      delete: (id: UUID, docId: UUID) => request<void>(`/vehicles/${id}/documents/${docId}`, { method: "DELETE" }),
    },
    maintenance: {
      list: (id: UUID, params?: PageParams) => request<PagedResponse<MaintenanceRecordDto>>(`/vehicles/${id}/maintenance${toQuery(params)}`),
      get: (id: UUID, maintenanceId: UUID) => request<MaintenanceRecordDto>(`/vehicles/${id}/maintenance/${maintenanceId}`),
      create: (id: UUID, body: MaintenanceRecordDto) => request<MaintenanceRecordDto>(`/vehicles/${id}/maintenance`, { method: "POST", body: json(body) }),
      update: (id: UUID, maintenanceId: UUID, body: MaintenanceRecordDto) => request<MaintenanceRecordDto>(`/vehicles/${id}/maintenance/${maintenanceId}`, { method: "PUT", body: json(body) }),
    },
    checklists: {
      list: (id: UUID, params?: PageParams) => request<PagedResponse<ChecklistInspectionDto>>(`/vehicles/${id}/checklists${toQuery(params)}`),
      get: (id: UUID, checklistId: UUID) => request<ChecklistInspectionDto>(`/vehicles/${id}/checklists/${checklistId}`),
      submit: (id: UUID, body: ChecklistInspectionDto) => request<ChecklistInspectionDto>(`/vehicles/${id}/checklists`, { method: "POST", body: json(body) }),
    },
  },
  checklistTemplates: {
    list: (vehicleType?: string) => request<ChecklistTemplateDto[]>(`/checklist-templates${toQuery({ vehicleType })}`),
    create: (body: ChecklistTemplateDto) => request<ChecklistTemplateDto>("/checklist-templates", { method: "POST", body: json(body) }),
    update: (id: UUID, body: ChecklistTemplateDto) => request<ChecklistTemplateDto>(`/checklist-templates/${id}`, { method: "PUT", body: json(body) }),
  },
  drivers: {
    list: (params?: PageParams & { status?: DriverStatus; location?: string }) =>
      request<PagedResponse<DriverResponseDto>>(`/drivers${toQuery(params)}`),
    get: (id: UUID) => request<DriverResponseDto>(`/drivers/${id}`),
    create: (body: DriverCreateDto) => request<DriverResponseDto>("/drivers", { method: "POST", body: json(body) }),
    update: (id: UUID, body: Partial<DriverCreateDto>) => request<DriverResponseDto>(`/drivers/${id}`, { method: "PUT", body: json(body) }),
    updateStatus: (id: UUID, status: DriverStatus) => request<DriverResponseDto>(`/drivers/${id}/status`, { method: "PATCH", body: json({ status }) }),
    delete: (id: UUID) => request<void>(`/drivers/${id}`, { method: "DELETE" }),
    availability: (id: UUID) => request<DriverAvailabilityDto>(`/drivers/${id}/availability`),
    documents: {
      list: (id: UUID) => request<DriverDocumentDto[]>(`/drivers/${id}/documents`),
      create: (id: UUID, body: DriverDocumentDto) => request<DriverDocumentDto>(`/drivers/${id}/documents`, { method: "POST", body: json(body) }),
      update: (id: UUID, docId: UUID, body: DriverDocumentDto) => request<DriverDocumentDto>(`/drivers/${id}/documents/${docId}`, { method: "PUT", body: json(body) }),
    },
  },
  activities: {
    list: (params?: PageParams & { status?: string; vehicleId?: UUID; driverId?: UUID; from?: string; to?: string }) =>
      request<PagedResponse<ActivityResponseDto>>(`/activities${toQuery(params)}`),
    get: (id: UUID) => request<ActivityResponseDto>(`/activities/${id}`),
    create: (body: ActivityCreateDto) => request<ActivityResponseDto>("/activities", { method: "POST", body: json(body) }),
    update: (id: UUID, body: Partial<ActivityCreateDto>) => request<ActivityResponseDto>(`/activities/${id}`, { method: "PUT", body: json(body) }),
    delete: (id: UUID) => request<ActivityResponseDto>(`/activities/${id}`, { method: "DELETE" }),
    allocate: (id: UUID, body: AllocationRequestDto) => request<ActivityResponseDto>(`/activities/${id}/allocate`, { method: "POST", body: json(body) }),
    transitionStatus: (id: UUID, body: StatusTransitionDto) => request<ActivityResponseDto>(`/activities/${id}/status`, { method: "PATCH", body: json(body) }),
    events: (id: UUID) => request<ActivityEventDto[]>(`/activities/${id}/events`),
  },
  alerts: {
    list: (params?: PageParams & { resolved?: boolean; severity?: AlertSeverity; entityType?: string }) =>
      request<PagedResponse<AlertResponseDto>>(`/alerts${toQuery(params)}`),
    get: (id: UUID) => request<AlertResponseDto>(`/alerts/${id}`),
    resolve: (id: UUID, resolvedBy?: string) => request<AlertResponseDto>(`/alerts/${id}/resolve`, { method: "PATCH", body: json({ resolvedBy }) }),
  },
  alertConfigurations: {
    list: () => request<AlertConfigurationDto[]>("/alert-configurations"),
    update: (id: UUID, body: AlertConfigurationUpdateDto) => request<AlertConfigurationDto>(`/alert-configurations/${id}`, { method: "PUT", body: json(body) }),
  },
  catalogItems: {
    list: (category?: CatalogCategory) => request<CatalogItemDto[]>(`/catalog-items${toQuery({ category })}`),
    create: (body: CatalogItemCreateDto) => request<CatalogItemDto>("/catalog-items", { method: "POST", body: json(body) }),
    update: (id: UUID, body: CatalogItemUpdateDto) => request<CatalogItemDto>(`/catalog-items/${id}`, { method: "PUT", body: json(body) }),
    activate: (id: UUID) => request<CatalogItemDto>(`/catalog-items/${id}/activate`, { method: "PATCH" }),
    deactivate: (id: UUID) => request<CatalogItemDto>(`/catalog-items/${id}/deactivate`, { method: "PATCH" }),
  },
  audit: {
    list: (params?: PageParams & { entityType?: string; entityId?: UUID; operation?: AuditOperation; performedBy?: string; from?: string; to?: string }) =>
      request<PagedResponse<AuditLogResponseDto>>(`/audit${toQuery(params)}`),
    get: (id: UUID) => request<AuditLogResponseDto>(`/audit/${id}`),
  },
  hr: {
    employees: {
      list: (params?: PageParams & { status?: EmployeeStatus; functionId?: UUID; q?: string }) =>
        request<PagedResponse<EmployeeResponseDto>>(`/hr/employees${toQuery(params)}`),
      get: (id: UUID) => request<EmployeeResponseDto>(`/hr/employees/${id}`),
      create: (body: EmployeeCreateDto) => request<EmployeeResponseDto>("/hr/employees", { method: "POST", body: json(body) }),
      update: (id: UUID, body: Partial<EmployeeCreateDto>) => request<EmployeeResponseDto>(`/hr/employees/${id}`, { method: "PUT", body: json(body) }),
      updateStatus: (id: UUID, status: EmployeeStatus) => request<EmployeeResponseDto>(`/hr/employees/${id}/status`, { method: "PATCH", body: json({ status }) }),
      delete: (id: UUID) => request<void>(`/hr/employees/${id}`, { method: "DELETE" }),
    },
    functions: {
      list: (params?: PageParams) => request<PagedResponse<EmployeeFunctionResponseDto>>(`/hr/functions${toQuery(params)}`),
      get: (id: UUID) => request<EmployeeFunctionResponseDto>(`/hr/functions/${id}`),
      create: (body: EmployeeFunctionCreateDto) => request<EmployeeFunctionResponseDto>("/hr/functions", { method: "POST", body: json(body) }),
      update: (id: UUID, body: Pick<EmployeeFunctionCreateDto, "name" | "description">) => request<EmployeeFunctionResponseDto>(`/hr/functions/${id}`, { method: "PUT", body: json(body) }),
      activate: (id: UUID) => request<void>(`/hr/functions/${id}/activate`, { method: "PATCH" }),
      deactivate: (id: UUID) => request<void>(`/hr/functions/${id}/deactivate`, { method: "PATCH" }),
    },
    salaryPayments: {
      list: (params?: PageParams & { year?: number; month?: number; employeeId?: UUID }) =>
        request<PagedResponse<SalaryPaymentResponseDto>>(`/hr/salary-payments${toQuery(params)}`),
      get: (id: UUID) => request<SalaryPaymentResponseDto>(`/hr/salary-payments/${id}`),
      create: (body: SalaryPaymentCreateDto) => request<SalaryPaymentResponseDto>("/hr/salary-payments", { method: "POST", body: json(body) }),
      cancel: (id: UUID, reason?: string) => request<SalaryPaymentResponseDto>(`/hr/salary-payments/${id}/cancel`, { method: "PATCH", body: json({ reason }) }),
      status: (params: PageParams & { year: number; month: number; status?: PaymentStatusFilter }) =>
        request<PagedResponse<EmployeePaymentStatusDto>>(`/hr/salary-payments/status${toQuery(params)}`),
    },
  },
  users: {
    list: () => request<UserResponseDto[]>("/users"),
    create: (body: UserCreateDto) => request<UserResponseDto>("/users", { method: "POST", body: json(body) }),
    disable: (id: string) => request<void>(`/users/${id}/disable`, { method: "PATCH" }),
    me: () => request<UserResponseDto>("/users/me"),
  },
  files: {
    upload: (file: File) => {
      const formData = new FormData();
      formData.set("file", file);
      return request<FileUploadResultDto>("/files", { method: "POST", body: formData });
    },
    download: async (id: string, fallbackFilename?: string) => {
      const result = await requestBlob(`/files/${id}`);
      downloadBlob(result.blob, result.filename ?? fallbackFilename ?? id);
    },
    downloadBlob: (id: string) => requestBlob(`/files/${id}`),
    downloadUrl: (id: string) => `${API_BASE_URL}/files/${id}`,
  },
};
