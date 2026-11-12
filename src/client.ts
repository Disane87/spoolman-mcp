import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

// ─────────────────────────────────────────────
//  Data Models (mirrors Spoolman REST API v1, tested against 0.27.x)
// ─────────────────────────────────────────────

/**
 * Extra (custom) field values. Spoolman stores every value as a JSON-encoded
 * string, e.g. `"42"` for an integer and `"\"hello\""` for a text field.
 * In requests, `null` clears a previously set value.
 */
export type ExtraValues = Record<string, string | null>;

export interface Tag {
  uid: string;
  format?: string;
  added: string;
}

export interface Vendor {
  id: number;
  registered: string;
  name: string;
  comment?: string;
  empty_spool_weight?: number;
  external_id?: string;
  extra?: Record<string, string>;
}

export type MultiColorDirection = "coaxial" | "longitudinal";

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
  multi_color_direction?: MultiColorDirection;
  external_id?: string;
  extra?: Record<string, string>;
  tags?: Tag[];
}

export interface Spool {
  id: number;
  registered: string;
  first_used?: string;
  last_used?: string;
  filament: Filament;
  price?: number;
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
  extra?: Record<string, string>;
  tags?: Tag[];
}

export interface SpoolmanInfo {
  version: string;
  debug_mode: boolean;
  automatic_backups: boolean;
  data_dir: string;
  logs_dir: string;
  backups_dir: string;
  db_type: string;
  external_db_name: string;
  git_commit?: string;
  build_date?: string;
  latest_version?: string;
  update_available: boolean;
}

export interface Setting {
  /** JSON-encoded value, e.g. `"\"EUR\""` for a string setting. */
  value: string;
  is_set: boolean;
  type: string;
}

export type ExtraFieldType =
  | "text"
  | "integer"
  | "integer_range"
  | "float"
  | "float_range"
  | "datetime"
  | "boolean"
  | "choice";

export interface ExtraFieldParameters {
  name: string;
  order?: number;
  unit?: string;
  field_type: ExtraFieldType;
  /** JSON-encoded default value. */
  default_value?: string;
  choices?: string[];
  multi_choice?: boolean;
}

export interface ExtraField extends ExtraFieldParameters {
  key: string;
  entity_type: EntityType;
}

export type EntityType = "vendor" | "filament" | "spool";

export interface Paged<T> {
  items: T[];
  /** Total number of matches ignoring limit/offset (from the x-total-count header). */
  total: number | null;
}

// ─────────────────────────────────────────────
//  Query Parameters
// ─────────────────────────────────────────────

/** Filters on extra fields, keyed by the full query param name (e.g. `extra.shelf`). */
export type ExtraFilters = Record<string, string>;

export interface VendorQuery {
  name?: string;
  external_id?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  extra_filters?: ExtraFilters;
}

export interface FilamentQuery {
  vendor_id?: string;
  vendor_name?: string;
  name?: string;
  material?: string;
  article_number?: string;
  color_hex?: string;
  color_similarity_threshold?: number;
  external_id?: string;
  tag?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  extra_filters?: ExtraFilters;
}

export interface SpoolFilters {
  filament_name?: string;
  filament_id?: string;
  filament_material?: string;
  filament_multi_color_direction?: string;
  vendor_name?: string;
  vendor_id?: string;
  location?: string;
  lot_nr?: string;
  allow_archived?: boolean;
  first_used?: string;
  last_used?: string;
  registered?: string;
  extra_filters?: ExtraFilters;
}

export interface SpoolQuery extends SpoolFilters {
  tag?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface SpoolGroupQuery extends SpoolFilters {
  group_by: string;
  include_empty?: boolean;
  preview?: boolean;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface SpoolGroupPage {
  groups: unknown[];
  total_groups: number | null;
  total_spools: number | null;
  total_remaining_weight: number | null;
}

export interface SearchQuery {
  q: string;
  color_similarity_threshold?: number;
  limit?: number;
  allow_archived?: boolean;
  spools_per_filament?: number;
}

export interface TagScanPayload {
  uid: string;
  reader_id?: string;
  name?: string;
  format?: string;
  payload_b64?: string;
  create?: boolean;
}

// ─────────────────────────────────────────────
//  Create / Update Payloads
// ─────────────────────────────────────────────

export interface CreateVendorPayload {
  name: string;
  comment?: string;
  empty_spool_weight?: number;
  external_id?: string;
  extra?: ExtraValues;
}

export type UpdateVendorPayload = Partial<CreateVendorPayload>;

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
  multi_color_direction?: MultiColorDirection | null;
  external_id?: string;
  extra?: ExtraValues;
}

export type UpdateFilamentPayload = Partial<CreateFilamentPayload>;

export interface CreateSpoolPayload {
  filament_id: number;
  price?: number;
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
  extra?: ExtraValues;
}

export type UpdateSpoolPayload = Partial<CreateSpoolPayload>;

export interface UseSpoolPayload {
  use_length?: number;
  use_weight?: number;
}

export interface MeasureSpoolPayload {
  weight: number;
}

// ─────────────────────────────────────────────
//  Errors
// ─────────────────────────────────────────────

/** Turn an axios error into one whose message carries Spoolman's own explanation. */
function toSpoolmanError(err: unknown): Error {
  if (!axios.isAxiosError(err)) return err instanceof Error ? err : new Error(String(err));
  const e = err as AxiosError<unknown>;
  const method = e.config?.method?.toUpperCase() ?? "";
  const url = e.config?.url ?? "";
  if (!e.response) {
    return new Error(`Could not reach Spoolman (${method} ${url}): ${e.message}`);
  }
  const { status, data } = e.response;
  let detail = "";
  if (data && typeof data === "object") {
    const body = data as Record<string, unknown>;
    if (typeof body.message === "string") {
      // 409 tag conflicts also carry spool_id/filament_id, but the message already names the holder.
      detail = body.message;
    } else if (Array.isArray(body.detail)) {
      // FastAPI validation errors
      detail = body.detail
        .map((d: { loc?: unknown[]; msg?: string }) => `${(d.loc ?? []).join(".")}: ${d.msg ?? ""}`)
        .join("; ");
    } else if (typeof body.detail === "string") {
      detail = body.detail;
    } else {
      detail = JSON.stringify(body);
    }
  } else if (typeof data === "string" && data.length > 0) {
    detail = data.slice(0, 500);
  }
  return new Error(`Spoolman returned ${status} for ${method} ${url}${detail ? `: ${detail}` : ""}`);
}

function headerNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Flatten extra-field filters into top-level query params and drop undefined values. */
function buildParams(query: object | undefined, renames: Record<string, string> = {}): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (!query) return params;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (key === "extra_filters") {
      Object.assign(params, value as ExtraFilters);
      continue;
    }
    params[renames[key] ?? key] = value;
  }
  return params;
}

const SPOOL_FILTER_RENAMES: Record<string, string> = {
  filament_name: "filament.name",
  filament_id: "filament.id",
  filament_material: "filament.material",
  filament_multi_color_direction: "filament.multi_color_direction",
  vendor_name: "filament.vendor.name",
  vendor_id: "filament.vendor.id",
};

const FILAMENT_FILTER_RENAMES: Record<string, string> = {
  vendor_name: "vendor.name",
  vendor_id: "vendor.id",
};

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
      timeout: 30000,
    };
    this.http = axios.create(config);
    this.http.interceptors.response.use(undefined, (err) => Promise.reject(toSpoolmanError(err)));
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

  async triggerBackup(): Promise<{ path: string; created?: boolean }> {
    const { data } = await this.http.post<{ path: string; created?: boolean }>("/backup");
    return data;
  }

  // ── Search ──────────────────────────────────

  async search(query: SearchQuery): Promise<unknown> {
    const { data } = await this.http.get("/search", { params: buildParams(query) });
    return data;
  }

  // ── Vendors ─────────────────────────────────

  async getVendors(query?: VendorQuery): Promise<Paged<Vendor>> {
    const res = await this.http.get<Vendor[]>("/vendor", { params: buildParams(query) });
    return { items: res.data, total: headerNumber(res.headers["x-total-count"]) };
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

  async getFilaments(query?: FilamentQuery): Promise<Paged<Filament>> {
    const res = await this.http.get<Filament[]>("/filament", {
      params: buildParams(query, FILAMENT_FILTER_RENAMES),
    });
    return { items: res.data, total: headerNumber(res.headers["x-total-count"]) };
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

  async linkFilamentTag(id: number, uid: string, format?: string): Promise<Tag> {
    const { data } = await this.http.post<Tag>(`/filament/${id}/tag`, { uid, format });
    return data;
  }

  async unlinkFilamentTag(id: number, uid: string): Promise<void> {
    await this.http.delete(`/filament/${id}/tag/${encodeURIComponent(uid)}`);
  }

  // ── Spools ───────────────────────────────────

  async getSpools(query?: SpoolQuery): Promise<Paged<Spool>> {
    const res = await this.http.get<Spool[]>("/spool", {
      params: buildParams(query, SPOOL_FILTER_RENAMES),
    });
    return { items: res.data, total: headerNumber(res.headers["x-total-count"]) };
  }

  async getSpoolGroups(query: SpoolGroupQuery): Promise<SpoolGroupPage> {
    const res = await this.http.get<unknown[]>("/spool/group", {
      params: buildParams(query, SPOOL_FILTER_RENAMES),
    });
    return {
      groups: res.data,
      total_groups: headerNumber(res.headers["x-total-count"]),
      total_spools: headerNumber(res.headers["x-total-spools"]),
      total_remaining_weight: headerNumber(res.headers["x-total-remaining-weight"]),
    };
  }

  async renameSpoolFieldValue(field: string, value: string, newValue: string): Promise<{ spools_updated: number }> {
    const { data } = await this.http.patch<{ spools_updated: number }>(
      `/spool/field/${encodeURIComponent(field)}`,
      { value, new_value: newValue }
    );
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

  async linkSpoolTag(id: number, uid: string, format?: string): Promise<Tag> {
    const { data } = await this.http.post<Tag>(`/spool/${id}/tag`, { uid, format });
    return data;
  }

  async unlinkSpoolTag(id: number, uid: string): Promise<void> {
    await this.http.delete(`/spool/${id}/tag/${encodeURIComponent(uid)}`);
  }

  // ── Tags ─────────────────────────────────────

  async scanTag(payload: TagScanPayload): Promise<unknown> {
    const { data } = await this.http.post("/tag/scan", payload);
    return data;
  }

  async getTagReaders(): Promise<unknown[]> {
    const { data } = await this.http.get<unknown[]>("/tag/reader");
    return data;
  }

  // ── Settings ─────────────────────────────────

  async getAllSettings(): Promise<Record<string, Setting>> {
    const { data } = await this.http.get<Record<string, Setting>>("/setting/");
    return data;
  }

  async getSetting(key: string): Promise<Setting> {
    const { data } = await this.http.get<Setting>(`/setting/${encodeURIComponent(key)}`);
    return data;
  }

  /**
   * Set a setting. Spoolman expects the request body to be a JSON string whose
   * content is the JSON-encoded value, i.e. the value is encoded twice.
   * Passing `null` resets the setting to its default.
   */
  async setSetting(key: string, value: unknown): Promise<Setting> {
    // Spoolman types the body as `str`, so a reset must be the JSON *string* "null", not a JSON null.
    const body = JSON.stringify(value === null ? "null" : JSON.stringify(value));
    const { data } = await this.http.post<Setting>(`/setting/${encodeURIComponent(key)}`, body, {
      // Prevent axios from re-serializing the already-encoded string.
      transformRequest: [(d) => d],
    });
    return data;
  }

  // ── Extra Fields ─────────────────────────────

  async getFields(entityType: EntityType): Promise<ExtraField[]> {
    const { data } = await this.http.get<ExtraField[]>(`/field/${entityType}`);
    return data;
  }

  async getFieldValues(entityType: EntityType, key: string): Promise<string[]> {
    const { data } = await this.http.get<string[]>(`/field/${entityType}/${encodeURIComponent(key)}/values`);
    return data;
  }

  /** Returns the full list of extra fields for the entity type. */
  async upsertField(entityType: EntityType, key: string, field: ExtraFieldParameters): Promise<ExtraField[]> {
    const { data } = await this.http.post<ExtraField[]>(`/field/${entityType}/${encodeURIComponent(key)}`, field);
    return data;
  }

  /** Returns the remaining extra fields for the entity type. */
  async deleteField(entityType: EntityType, key: string): Promise<ExtraField[]> {
    const { data } = await this.http.delete<ExtraField[]>(`/field/${entityType}/${encodeURIComponent(key)}`);
    return data;
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
    // The path segment is `{location:path}`, so slashes are allowed; encode everything else.
    const path = location.split("/").map(encodeURIComponent).join("/");
    await this.http.patch(`/location/${path}`, { name: newName });
  }

  // ── External database (SpoolmanDB) ───────────

  async searchExternalFilaments(query: string, limit = 20, offset = 0): Promise<Paged<unknown>> {
    const res = await this.http.get<unknown[]>("/external/filament/search", { params: { query, limit, offset } });
    return { items: res.data, total: headerNumber(res.headers["x-total-count"]) };
  }

  async getExternalMaterials(): Promise<unknown[]> {
    const { data } = await this.http.get<unknown[]>("/external/material");
    return data;
  }

  // ── Export ───────────────────────────────────

  private async export(path: string, format: "csv" | "json", extra: Record<string, unknown> = {}): Promise<string> {
    const { data } = await this.http.get(path, {
      params: { fmt: format, ...extra },
      responseType: "text",
      transformResponse: [(d) => d],
    });
    return typeof data === "string" ? data : JSON.stringify(data);
  }

  async exportSpools(format: "csv" | "json" = "json", allowArchived = false): Promise<string> {
    return this.export("/export/spools", format, { allow_archived: allowArchived });
  }

  async exportFilaments(format: "csv" | "json" = "json"): Promise<string> {
    return this.export("/export/filaments", format);
  }

  async exportVendors(format: "csv" | "json" = "json"): Promise<string> {
    return this.export("/export/vendors", format);
  }
}
