export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      queues: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          creator_id: string
          active: boolean
          access_code: string | null
          settings: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          creator_id: string
          active?: boolean
          access_code?: string | null
          settings?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          creator_id?: string
          active?: boolean
          access_code?: string | null
          settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "queues_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      songs: {
        Row: {
          id: string
          created_at: string
          queue_id: string
          title: string
          artist: string
          album: string | null
          duration: number | null
          added_by: string
          track_uri: string | null
          cover_url: string | null
          played: boolean
          played_at: string | null
          position: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          queue_id: string
          title: string
          artist: string
          album?: string | null
          duration?: number | null
          added_by: string
          track_uri?: string | null
          cover_url?: string | null
          played?: boolean
          played_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          queue_id?: string
          title?: string
          artist?: string
          album?: string | null
          duration?: number | null
          added_by?: string
          track_uri?: string | null
          cover_url?: string | null
          played?: boolean
          played_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "queues"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string
          created_at: string
          song_id: string
          profile_id: string
          vote_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          song_id: string
          profile_id: string
          vote_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          song_id?: string
          profile_id?: string
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
