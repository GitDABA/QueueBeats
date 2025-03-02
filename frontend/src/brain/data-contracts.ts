/** AddSongRequest */
export interface AddSongRequest {
  /** Queue Id */
  queue_id: string;
  /** Song Id */
  song_id: string;
  /** User Id */
  user_id: string;
}

/** ApiInfoResponse */
export interface ApiInfoResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
  /** Base Url */
  base_url: string;
}

/** ApiResponse */
export interface ApiResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthCheckResponse */
export interface HealthCheckResponse {
  /** Status */
  status: string;
  /** Message */
  message: string;
  /**
   * Api Version
   * @default "1.0.0"
   */
  api_version?: string;
  /**
   * Environment
   * @default "production"
   */
  environment?: string;
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** RequestInfoResponse */
export interface RequestInfoResponse {
  /** Headers */
  headers: Record<string, string>;
  /** Url */
  url: string;
  /** Method */
  method: string;
  /** Client */
  client: object;
  /** Base Url */
  base_url: string;
}

/** SearchResponse */
export interface SearchResponse {
  /** Tracks */
  tracks: SpotifyTrack[];
}

/** SetupResponse */
export interface SetupResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Tables Created */
  tables_created?: string[] | null;
  /** Test User */
  test_user?: object | null;
}

/** SongResponse */
export interface SongResponse {
  /** Id */
  id: string;
  /** Queue Id */
  queue_id: string;
  /** Title */
  title: string;
  /** Artist */
  artist: string;
  /** Album */
  album?: string | null;
  /** Cover Url */
  cover_url?: string | null;
  /** Added By */
  added_by: string;
  /** Created At */
  created_at: string;
}

/** SongSearchResponse */
export interface SongSearchResponse {
  /** Results */
  results: SongSearchResult[];
}

/** SongSearchResult */
export interface SongSearchResult {
  /** Id */
  id: string;
  /** Title */
  title: string;
  /** Artist */
  artist: string;
  /** Album */
  album?: string | null;
  /** Cover Url */
  cover_url?: string | null;
  /** Duration Ms */
  duration_ms?: number | null;
}

/** SpotifyAuthRequest */
export interface SpotifyAuthRequest {
  /** Code */
  code: string;
  /** Redirect Uri */
  redirect_uri: string;
}

/** SpotifyAuthResponse */
export interface SpotifyAuthResponse {
  /** Access Token */
  access_token: string;
  /** Refresh Token */
  refresh_token: string;
  /** Expires In */
  expires_in: number;
}

/** SpotifyConfigResponse */
export interface SpotifyConfigResponse {
  /** Client Id */
  client_id: string;
  /** Redirect Uri */
  redirect_uri: string;
}

/** SpotifyTokenRequest */
export interface SpotifyTokenRequest {
  /** Refresh Token */
  refresh_token: string;
}

/** SpotifyTrack */
export interface SpotifyTrack {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Uri */
  uri: string;
  /** Artists */
  artists: string[];
  /** Album */
  album: string;
  /** Album Art */
  album_art: string;
  /** Duration Ms */
  duration_ms: number;
  /** Popularity */
  popularity?: number | null;
  /** Preview Url */
  preview_url?: string | null;
}

/** SupabaseConfig */
export interface SupabaseConfig {
  /** Supabase Url */
  supabase_url: string;
  /** Supabase Anon Key */
  supabase_anon_key: string;
  /** Api Base Url */
  api_base_url: string;
}

/** SupabaseConfigResponse */
export interface SupabaseConfigResponse {
  /** Supabase Url */
  supabase_url: string;
  /** Supabase Anon Key */
  supabase_anon_key: string;
  /**
   * Api Base Url
   * @default ""
   */
  api_base_url?: string;
}

/** SystemInfoResponse */
export interface SystemInfoResponse {
  /** Python Version */
  python_version: string;
  /** Platform */
  platform: string;
  /** Env Variables */
  env_variables: Record<string, string>;
  /** Server Time */
  server_time: string;
}

/** UrlInfo */
export interface UrlInfo {
  /** Base Url */
  base_url: string;
  /** Api Url */
  api_url: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export type GetApiInfo2Data = ApiInfoResponse;

export type GetSupabaseConfigAltData = SupabaseConfigResponse;

export type GetSupabaseClientConfigAltData = SupabaseConfigResponse;

export type GetSupabaseConfig2Data = SupabaseConfigResponse;

export type GetSupabaseClientConfigData = SupabaseConfig;

export type DebugHealthCheckData = HealthCheckResponse;

export type DebugRequestData = RequestInfoResponse;

export type DebugSystemInfoData = SystemInfoResponse;

export type GetApiInfoData = ApiResponse;

export type GetUrlInfoData = UrlInfo;

export type SetupDatabaseData = SetupResponse;

export type CreateTestDataData = SetupResponse;

export interface SearchSpotifySongsParams {
  /**
   * Query
   * Search query for songs
   */
  query: string;
  /**
   * Limit
   * Maximum number of results to return
   * @min 1
   * @max 50
   * @default 10
   */
  limit?: number;
}

export type SearchSpotifySongsData = SearchResponse;

export type SearchSpotifySongsError = HTTPValidationError;

export type GetSpotifyConfigData = SpotifyConfigResponse;

export type ExchangeCodeForTokenData = SpotifyAuthResponse;

export type ExchangeCodeForTokenError = HTTPValidationError;

export type RefreshTokenData = SpotifyAuthResponse;

export type RefreshTokenError = HTTPValidationError;

export interface SearchSongsParams {
  /**
   * Query
   * @minLength 1
   */
  query: string;
}

export type SearchSongsData = SongSearchResponse;

export type SearchSongsError = HTTPValidationError;

export type AddSongToQueueData = SongResponse;

export type AddSongToQueueError = HTTPValidationError;

export type GetSupabaseConfigData = SupabaseConfigResponse;

export type GetSupabaseClientConfig2Data = SupabaseConfigResponse;
