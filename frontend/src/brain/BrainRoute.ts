import {
  AddSongRequest,
  AddSongToQueueData,
  CheckHealthData,
  CreateTestDataData,
  DebugHealthCheckData,
  DebugRequestData,
  DebugSystemInfoData,
  ExchangeCodeForTokenData,
  GetApiInfo2Data,
  GetApiInfoData,
  GetSpotifyConfigData,
  GetSupabaseClientConfig2Data,
  GetSupabaseClientConfigAltData,
  GetSupabaseClientConfigData,
  GetSupabaseConfig2Data,
  GetSupabaseConfigAltData,
  GetSupabaseConfigData,
  GetUrlInfoData,
  RefreshTokenData,
  SearchSongsData,
  SearchSongsParams,
  SearchSpotifySongsData,
  SetupDatabaseData,
  SpotifyAuthRequest,
  SpotifyTokenRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Get API connection information. This is a simple endpoint to test API connectivity. It returns basic info about the API connection, including the detected base URL.
   * @tags utils, dbtn/module:api_utils
   * @name get_api_info2
   * @summary Get Api Info2
   * @request GET:/routes/api-utils/info
   */
  export namespace get_api_info2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetApiInfo2Data;
  }

  /**
   * @description Alternate route for Supabase configuration to avoid CORS issues.
   * @tags config, dbtn/module:supabase_config2
   * @name get_supabase_config_alt
   * @summary Get Supabase Config Alt
   * @request GET:/routes/api/supabase-config/
   */
  export namespace get_supabase_config_alt {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSupabaseConfigAltData;
  }

  /**
   * @description Client-specific alternate route for Supabase configuration.
   * @tags config, dbtn/module:supabase_config2
   * @name get_supabase_client_config_alt
   * @summary Get Supabase Client Config Alt
   * @request GET:/routes/api/supabase-config/client
   */
  export namespace get_supabase_client_config_alt {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSupabaseClientConfigAltData;
  }

  /**
   * @description Get the Supabase configuration details needed for the frontend.
   * @tags config, dbtn/module:supabase2
   * @name get_supabase_config2
   * @summary Get Supabase Config2
   * @request GET:/routes/supabase-config2/
   */
  export namespace get_supabase_config2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSupabaseConfig2Data;
  }

  /**
   * @description Get Supabase configuration for the frontend
   * @tags supabase, dbtn/module:supabase
   * @name get_supabase_client_config
   * @summary Get Supabase Client Config
   * @request GET:/routes/supabase/config
   */
  export namespace get_supabase_client_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSupabaseClientConfigData;
  }

  /**
   * @description Simple health check endpoint to verify API connectivity. Returns a success response with basic API details.
   * @tags debug, dbtn/module:debug
   * @name debug_health_check
   * @summary Health check endpoint
   * @request GET:/debug/health
   */
  export namespace debug_health_check {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DebugHealthCheckData;
  }

  /**
   * @description Debug endpoint that returns detailed information about the current request. Useful for diagnosing connection and CORS issues.
   * @tags debug, dbtn/module:debug
   * @name debug_request
   * @summary Request debug info
   * @request GET:/debug/request
   */
  export namespace debug_request {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DebugRequestData;
  }

  /**
   * @description Returns system information for debugging deployment environment issues.
   * @tags debug, dbtn/module:debug
   * @name debug_system_info
   * @summary System debug info
   * @request GET:/debug/system
   */
  export namespace debug_system_info {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DebugSystemInfoData;
  }

  /**
   * @description Health check endpoint for the utils API
   * @tags utils, dbtn/module:utils
   * @name get_api_info
   * @summary Get Api Info
   * @request GET:/routes/utils/
   */
  export namespace get_api_info {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetApiInfoData;
  }

  /**
   * @description Get URL information for the API
   * @tags utils, dbtn/module:utils
   * @name get_url_info
   * @summary Get Url Info
   * @request GET:/routes/utils/url-info
   */
  export namespace get_url_info {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUrlInfoData;
  }

  /**
   * @description Set up the database tables and create test data.
   * @tags dbtn/module:setup
   * @name setup_database
   * @summary Setup Database
   * @request POST:/routes/database
   */
  export namespace setup_database {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SetupDatabaseData;
  }

  /**
   * @description Create test data for the application.
   * @tags dbtn/module:setup
   * @name create_test_data
   * @summary Create Test Data
   * @request POST:/routes/test-data
   */
  export namespace create_test_data {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTestDataData;
  }

  /**
   * @description Search for songs on Spotify
   * @tags dbtn/module:spotify_search
   * @name search_spotify_songs
   * @summary Search Spotify Songs
   * @request GET:/routes/spotify/search
   */
  export namespace search_spotify_songs {
    export type RequestParams = {};
    export type RequestQuery = {
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
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchSpotifySongsData;
  }

  /**
   * @description Get Spotify client ID and redirect URI
   * @tags dbtn/module:spotify_auth
   * @name get_spotify_config
   * @summary Get Spotify Config
   * @request GET:/routes/spotify/config
   */
  export namespace get_spotify_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSpotifyConfigData;
  }

  /**
   * @description Exchange authorization code for access token
   * @tags dbtn/module:spotify_auth
   * @name exchange_code_for_token
   * @summary Exchange Code For Token
   * @request POST:/routes/spotify/token
   */
  export namespace exchange_code_for_token {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SpotifyAuthRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ExchangeCodeForTokenData;
  }

  /**
   * @description Refresh an expired access token
   * @tags dbtn/module:spotify_auth
   * @name refresh_token
   * @summary Refresh Token
   * @request POST:/routes/spotify/refresh
   */
  export namespace refresh_token {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SpotifyTokenRequest;
    export type RequestHeaders = {};
    export type ResponseBody = RefreshTokenData;
  }

  /**
   * @description Search for songs by title or artist
   * @tags dbtn/module:songs
   * @name search_songs
   * @summary Search Songs
   * @request GET:/routes/songs/songs/search
   */
  export namespace search_songs {
    export type RequestParams = {};
    export type RequestQuery = SearchSongsParams;
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchSongsData;
  }

  /**
   * @description Add a song to a queue
   * @tags dbtn/module:songs
   * @name add_song_to_queue
   * @summary Add Song To Queue
   * @request POST:/routes/songs/songs/add
   */
  export namespace add_song_to_queue {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AddSongRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AddSongToQueueData;
  }

  /**
   * @description Get the Supabase configuration details needed for the frontend.
   * @tags config, dbtn/module:supabase_config
   * @name get_supabase_config
   * @summary Get Supabase Config
   * @request GET:/routes/supabase-config/
   */
  export namespace get_supabase_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSupabaseConfigData;
  }

  /**
   * @description Client-specific endpoint for Supabase configuration. This is a dedicated endpoint for frontend use to reduce CORS issues.
   * @tags config, dbtn/module:supabase_config
   * @name get_supabase_client_config2
   * @summary Get Supabase Client Config
   * @request GET:/routes/supabase-config/client
   * @originalName get_supabase_client_config
   * @duplicate
   */
  export namespace get_supabase_client_config2 {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSupabaseClientConfig2Data;
  }
}
