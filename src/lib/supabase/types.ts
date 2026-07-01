export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MemberRole = 'owner' | 'editor' | 'viewer'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: MemberRole
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: MemberRole
          created_at?: string
        }
        Update: {
          role?: MemberRole
        }
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          website: string | null
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: MemberRole
          token: string
          expires_at: string
          accepted_at: string | null
          invited_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          role?: MemberRole
          token?: string
          expires_at?: string
          accepted_at?: string | null
          invited_by?: string | null
          created_at?: string
        }
        Update: {
          accepted_at?: string | null
        }
        Relationships: []
      }
      sites: {
        Row: {
          id: string
          organization_id: string
          name: string
          slug: string
          description: string | null
          visibility: 'public' | 'private' | 'unlisted'
          custom_domain: string | null
          favicon_url: string | null
          logo_url: string | null
          theme_config: Json
          meta_config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          slug: string
          description?: string | null
          visibility?: 'public' | 'private' | 'unlisted'
          custom_domain?: string | null
          favicon_url?: string | null
          logo_url?: string | null
          theme_config?: Json
          meta_config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          visibility?: 'public' | 'private' | 'unlisted'
          custom_domain?: string | null
          favicon_url?: string | null
          logo_url?: string | null
          theme_config?: Json
          meta_config?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sites_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      spaces: {
        Row: {
          id: string
          site_id: string
          name: string
          slug: string
          description: string | null
          position: number
          git_repo: string | null
          git_branch: string | null
          git_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_id: string
          name: string
          slug: string
          description?: string | null
          position?: number
          git_repo?: string | null
          git_branch?: string | null
          git_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          position?: number
          git_repo?: string | null
          git_branch?: string | null
          git_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'spaces_site_id_fkey'
            columns: ['site_id']
            isOneToOne: false
            referencedRelation: 'sites'
            referencedColumns: ['id']
          }
        ]
      }
      pages: {
        Row: {
          id: string
          space_id: string
          parent_id: string | null
          title: string
          slug: string
          position: number
          type: 'page' | 'group' | 'link' | 'divider'
          published: boolean
          git_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          space_id: string
          parent_id?: string | null
          title: string
          slug: string
          position?: number
          type?: 'page' | 'group' | 'link' | 'divider'
          published?: boolean
          git_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          parent_id?: string | null
          title?: string
          slug?: string
          position?: number
          type?: 'page' | 'group' | 'link' | 'divider'
          published?: boolean
          git_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'pages_space_id_fkey'
            columns: ['space_id']
            isOneToOne: false
            referencedRelation: 'spaces'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pages_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'pages'
            referencedColumns: ['id']
          }
        ]
      }
      page_versions: {
        Row: {
          id: string
          page_id: string
          content: Json
          version_label: string | null
          created_by: string | null
          is_current: boolean
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          content?: Json
          version_label?: string | null
          created_by?: string | null
          is_current?: boolean
          created_at?: string
        }
        Update: {
          content?: Json
          version_label?: string | null
          is_current?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'page_versions_page_id_fkey'
            columns: ['page_id']
            isOneToOne: false
            referencedRelation: 'pages'
            referencedColumns: ['id']
          }
        ]
      }
      redirects: {
        Row: {
          id: string
          site_id: string
          from_path: string
          to_path: string
          status_code: number
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          from_path: string
          to_path: string
          status_code?: number
          created_at?: string
        }
        Update: {
          from_path?: string
          to_path?: string
          status_code?: number
        }
        Relationships: [
          {
            foreignKeyName: 'redirects_site_id_fkey'
            columns: ['site_id']
            isOneToOne: false
            referencedRelation: 'sites'
            referencedColumns: ['id']
          }
        ]
      }
      page_ratings: {
        Row: {
          id: string
          page_id: string
          rating: number
          comment: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          rating: number
          comment?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: 'page_ratings_page_id_fkey'
            columns: ['page_id']
            isOneToOne: false
            referencedRelation: 'pages'
            referencedColumns: ['id']
          }
        ]
      }
      site_analytics: {
        Row: {
          id: string
          site_id: string
          page_id: string | null
          path: string
          referrer: string | null
          country: string | null
          device: 'desktop' | 'mobile' | 'tablet' | null
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          page_id?: string | null
          path: string
          referrer?: string | null
          country?: string | null
          device?: 'desktop' | 'mobile' | 'tablet' | null
          created_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: 'site_analytics_site_id_fkey'
            columns: ['site_id']
            isOneToOne: false
            referencedRelation: 'sites'
            referencedColumns: ['id']
          }
        ]
      }
      api_keys: {
        Row: {
          id: string
          organization_id: string
          name: string
          key_hash: string
          last_used_at: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          key_hash: string
          last_used_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          last_used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'api_keys_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      member_role: MemberRole
    }
    CompositeTypes: Record<string, never>
  }
}
