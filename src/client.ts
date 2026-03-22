import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// ─────────────────────────────────────────────
//  Data Models
// ─────────────────────────────────────────────

export interface Vendor {
  id: number;
  registered: string;
  name: string;
  comment?: string;
  extra?: Record<string, unknown>;
}

export interface Filament {
  id: number;
  registered: string;
  name?: string;
  vendor?: Vendor;
  material?: string;
  price?: number;
  density: number;
  diameter: number;
  weight?: number;
  spool_weight?: number;
  article_number?: string;
  comment?: string;
  settings_extruder_temp?: number;
  settings_bed_temp?: number;
  color_hex?: string;
  multi_color_hexes?: string;
  multi_color_direction?: string;
  external_id?: string;
  extra?: Record<string, unknown>;
}

export interface Spool {
  id: number;
  registered: string;
  first_used?: string;
  last_used?: string;
  filament: Filament;
  remaining_weight?: number;
  initial_weight?: number;
  spool_weight?: number;
  used_weight: number;
  remaining_length?: number;
  used_length: number;
  location?: string;
  lot_nr?: string;
  comment?: string;
  archived: boolean;
  extra?: Record<string, unknown>;
}

export interface SpoolmanInfo {
  version: string;
  debug_mode: boolean;
  allow_cors: boolean;
  data_dir: string;
  logs_dir: string;
  backups_dir: string;
  db_type: string;
  git_commit?: string;
}

export interface Setting {
  value: unknown;
}

export interface ExtraField {
  name: string;
  order: number;
  unit?: string;
  field_type: "text" | "integer" | "integer_range" | "float" | "float_range" | "datetime" | "boolean" | "choice";
  default_value?: unknown;
  choices?: string[];
}

export type EntityType = "vendor" | "filament" | "spool";

// ─────────────────────────────────────────────
//  Query Parameters
// ─────────────────────────────────────────────

export interface FilamentQuery {
  vendor_id?: number;
  vendor_name?: string;
  name?: string;
  material?: string;
  article_number?: string;
  color_hex?: string;
  external_id?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface SpoolQuery {
  filament_name?: string;
  filament_id?: number;
  filament_material?: string;
  vendor_name?: string;
  vendor_id?: number;
  location?: string;
  lot_nr?: string;
  allow_archived?: boolean;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface VendorQuery {
  name?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

// ─────────────────────────────────────────────
//  Create / Update Payloads
// ─────────────────────────────────────────────

export interface CreateVendorPayload {
  name: string;
  comment?: string;
  extra?: Record<string, unknown>;
}

export interface UpdateVendorPayload extends Partial<CreateVendorPayload> {}

export interface CreateFilamentPayload {
  name?: string;
  vendor_id?: number;
  material?: string;
  price?: number;
  density: number;
  diameter: number;
  weight?: number;
  spool_weight?: number;
  article_number?: string;
  comment?: string;
  settings_extruder_temp?: number;
  settings_bed_temp?: number;
  color_hex?: string;
  multi_color_hexes?: string;
  multi_color_direction?: string;
  external_id?: string;
  extra?: Record<string, unknown>;
}

export interface UpdateFilamentPayload extends Partial<CreateFilamentPayload> {}

export interface CreateSpoolPayload {
  filament_id: number;
  remaining_weight?: number;
  used_weight?: number;
  initial_weight?: number;
  spool_weight?: number;
  first_used?: string;
  last_used?: string;
  location?: string;
  lot_nr?: string;
  comment?: string;
  archived?: boolean;
  extra?: Record<string, unknown>;
}

export interface UpdateSpoolPayload extends Partial<Omit<CreateSpoolPayload, "filament_id">> {
  filament_id?: number;
}

export interface UseSpoolPayload {
  use_length?: number;
  use_weight?: number;
}

export interface MeasureSpoolPayload {
  weight: number;
}

// ─────────────────────────────────────────────
//  Spoolman Client
// ─────────────────────────────────────────────

export class SpoolmanClient {
  private http: AxiosInstance;

  constructor(baseUrl: string, apiKey?: string) {
    const config: AxiosRequestConfig = {
      baseURL: baseUrl.replace(/\/$/, "") + "/api/v1",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
    };
    this.http = axios.create(config);
  }

  // ── System ──────────────────────────────────

  async getInfo(): Promise<SpoolmanInfo> {
    const { data } = await this.http.get<SpoolmanInfo>("/info");
    return data;
  }

  async getHealth(): Promise<{ status: string }> {
    const { data } = await this.http.get<{ status: string }>("/health");
    return data;
  }

  async triggerBackup(): Promise<{ path: string }> {
    const { data } = await this.http.post<{ path: string }>("/backup");
    return data;
  }

  // ── Vendors ─────────────────────────────────

  async getVendors(query?: VendorQuery): Promise<Vendor[]> {
    const { data } = await this.http.get<Vendor[]>("/vendor", { params: query });
    return data;
  }

  async getVendor(id: number): Promise<Vendor> {
    const { data } = await this.http.get<Vendor>(`/vendor/${id}`);
    return data;
  }

  async createVendor(payload: CreateVendorPayload): Promise<Vendor> {
    const { data } = await this.http.post<Vendor>("/vendor", payload);
    return data;
  }

  async updateVendor(id: number, payload: UpdateVendorPayload): Promise<Vendor> {
    const { data } = await this.http.patch<Vendor>(`/vendor/${id}`, payload);
    return data;
  }

  async deleteVendor(id: number): Promise<void> {
    await this.http.delete(`/vendor/${id}`);
  }

  // ── Filaments ────────────────────────────────

  async getFilaments(query?: FilamentQuery): Promise<Filament[]> {
    const { data } = await this.http.get<Filament[]>("/filament", { params: query });
    return data;
  }

  async getFilament(id: number): Promise<Filament> {
    const { data } = await this.http.get<Filament>(`/filament/${id}`);
    return data;
  }

  async createFilament(payload: CreateFilamentPayload): Promise<Filament> {
    const { data } = await this.http.post<Filament>("/filament", payload);
    return data;
  }

  async updateFilament(id: number, payload: UpdateFilamentPayload): Promise<Filament> {
    const { data } = await this.http.patch<Filament>(`/filament/${id}`, payload);
    return data;
  }

  async deleteFilament(id: number): Promise<void> {
    await this.http.delete(`/filament/${id}`);
  }

  // ── Spools ───────────────────────────────────

  async getSpools(query?: SpoolQuery): Promise<Spool[]> {
    const { data } = await this.http.get<Spool[]>("/spool", { params: query });
    return data;
  }

  async getSpool(id: number): Promise<Spool> {
    const { data } = await this.http.get<Spool>(`/spool/${id}`);
    return data;
  }

  async createSpool(payload: CreateSpoolPayload): Promise<Spool> {
    const { data } = await this.http.post<Spool>("/spool", payload);
    return data;
  }

  async updateSpool(id: number, payload: UpdateSpoolPayload): Promise<Spool> {
    const { data } = await this.http.patch<Spool>(`/spool/${id}`, payload);
    return data;
  }

  async deleteSpool(id: number): Promise<void> {
    await this.http.delete(`/spool/${id}`);
  }

  async useSpool(id: number, payload: UseSpoolPayload): Promise<Spool> {
    const { data } = await this.http.put<Spool>(`/spool/${id}/use`, payload);
    return data;
  }

  async measureSpool(id: number, payload: MeasureSpoolPayload): Promise<Spool> {
    const { data } = await this.http.put<Spool>(`/spool/${id}/measure`, payload);
    return data;
  }

  // ── Settings ─────────────────────────────────

  async getAllSettings(): Promise<Record<string, Setting>> {
    const { data } = await this.http.get<Record<string, Setting>>("/setting/");
    return data;
  }

  async getSetting(key: string): Promise<Setting> {
    const { data } = await this.http.get<Setting>(`/setting/${key}`);
    return data;
  }

  async setSetting(key: string, value: unknown): Promise<Setting> {
    const { data } = await this.http.post<Setting>(`/setting/${key}`, { value });
    return data;
  }

  // ── Extra Fields ─────────────────────────────

  async getFields(entityType: EntityType): Promise<ExtraField[]> {
    const { data } = await this.http.get<ExtraField[]>(`/field/${entityType}`);
    return data;
  }

  async upsertField(entityType: EntityType, key: string, field: Omit<ExtraField, "name"> & { name?: string }): Promise<ExtraField> {
    const { data } = await this.http.post<ExtraField>(`/field/${entityType}/${key}`, field);
    return data;
  }

  async deleteField(entityType: EntityType, key: string): Promise<void> {
    await this.http.delete(`/field/${entityType}/${key}`);
  }

  // ── Lookup ───────────────────────────────────

  async getMaterials(): Promise<string[]> {
    const { data } = await this.http.get<string[]>("/material");
    return data;
  }

  async getArticleNumbers(): Promise<string[]> {
    const { data } = await this.http.get<string[]>("/article-number");
    return data;
  }

  async getLotNumbers(): Promise<string[]> {
    const { data } = await this.http.get<string[]>("/lot-number");
    return data;
  }

  async getLocations(): Promise<string[]> {
    const { data } = await this.http.get<string[]>("/location");
    return data;
  }

  async renameLocation(location: string, newName: string): Promise<void> {
    await this.http.patch(`/location/${encodeURIComponent(location)}`, { new_name: newName });
  }

  // ── Export ───────────────────────────────────

  async exportSpools(format: "csv" | "json" = "json"): Promise<string> {
    const { data } = await this.http.get<string>("/export/spools", { params: { format } });
    return typeof data === "string" ? data : JSON.stringify(data);
  }

  async exportFilaments(format: "csv" | "json" = "json"): Promise<string> {
    const { data } = await this.http.get<string>("/export/filaments", { params: { format } });
    return typeof data === "string" ? data : JSON.stringify(data);
  }

  async exportVendors(format: "csv" | "json" = "json"): Promise<string> {
    const { data } = await this.http.get<string>("/export/vendors", { params: { format } });
    return typeof data === "string" ? data : JSON.stringify(data);
  }
}
