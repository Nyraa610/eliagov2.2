export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assessment_progress: {
        Row: {
          assessment_type: string
          created_at: string | null
          form_data: Json | null
          id: string
          progress: number
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_type: string
          created_at?: string | null
          form_data?: Json | null
          id?: string
          progress?: number
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_type?: string
          created_at?: string | null
          form_data?: Json | null
          id?: string
          progress?: number
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          criteria: Json
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: string
          id: string
          issued_at: string | null
          points_earned: number
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          course_id: string
          id?: string
          issued_at?: string | null
          points_earned?: number
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          course_id?: string
          id?: string
          issued_at?: string | null
          points_earned?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          assistant_response: string
          created_at: string | null
          id: string
          user_id: string
          user_message: string
        }
        Insert: {
          assistant_response: string
          created_at?: string | null
          id?: string
          user_id: string
          user_message: string
        }
        Update: {
          assistant_response?: string
          created_at?: string | null
          id?: string
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
      code_redemptions: {
        Row: {
          code_id: string
          company_id: string | null
          id: string
          redeemed_at: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          code_id: string
          company_id?: string | null
          id?: string
          redeemed_at?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          code_id?: string
          company_id?: string | null
          id?: string
          redeemed_at?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "promotion_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_redemptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "code_redemptions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          country: string | null
          created_at: string
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          registry_city: string | null
          registry_number: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          registry_city?: string | null
          registry_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          registry_city?: string | null
          registry_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_documents: {
        Row: {
          company_id: string
          created_at: string
          document_type: string | null
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          updated_at: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          company_id: string
          created_at?: string
          document_type?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          updated_at?: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          company_id?: string
          created_at?: string
          document_type?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          updated_at?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_integrations: {
        Row: {
          api_key: string
          company_id: string
          created_at: string | null
          id: string
          integration_type: string
          is_connected: boolean | null
          metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          api_key: string
          company_id: string
          created_at?: string | null
          id?: string
          integration_type: string
          is_connected?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          company_id?: string
          created_at?: string | null
          id?: string
          integration_type?: string
          is_connected?: boolean | null
          metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_user_roles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_admin: boolean
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_admin?: boolean
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      content_completions: {
        Row: {
          completed_at: string | null
          content_item_id: string
          id: string
          is_completed: boolean
          quiz_score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_item_id: string
          id?: string
          is_completed?: boolean
          quiz_score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_item_id?: string
          id?: string
          is_completed?: boolean
          quiz_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_completions_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          content: string | null
          content_type: string
          created_at: string | null
          id: string
          module_id: string
          sequence_order: number
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          content_type: string
          created_at?: string | null
          id?: string
          module_id: string
          sequence_order: number
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          content_type?: string
          created_at?: string | null
          id?: string
          module_id?: string
          sequence_order?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          points: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          points?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          points?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      emission_factors: {
        Row: {
          category: string | null
          code: string | null
          created_at: string
          emission_value: number | null
          id: string
          name: string
          source: string | null
          subcategory: string | null
          uncertainty_percent: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string
          emission_value?: number | null
          id?: string
          name: string
          source?: string | null
          subcategory?: string | null
          uncertainty_percent?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string
          emission_value?: number | null
          id?: string
          name?: string
          source?: string | null
          subcategory?: string | null
          uncertainty_percent?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hubspot_contacts: {
        Row: {
          company_id: string
          company_name: string | null
          created_at: string
          email: string | null
          first_name: string | null
          hubspot_id: string
          id: string
          last_name: string | null
          last_synced_at: string
          raw_data: Json | null
          sustainability_score: number | null
          updated_at: string
        }
        Insert: {
          company_id: string
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          hubspot_id: string
          id?: string
          last_name?: string | null
          last_synced_at?: string
          raw_data?: Json | null
          sustainability_score?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          hubspot_id?: string
          id?: string
          last_name?: string | null
          last_synced_at?: string
          raw_data?: Json | null
          sustainability_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      hubspot_integrations: {
        Row: {
          access_token: string | null
          company_id: string
          created_at: string
          id: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          company_id: string
          created_at?: string
          id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          company_id?: string
          created_at?: string
          id?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      hubspot_notes: {
        Row: {
          analyzed: boolean | null
          company_id: string
          contact_id: string | null
          content: string | null
          created_at: string
          hubspot_id: string
          id: string
          last_synced_at: string
          raw_data: Json | null
          sustainability_keywords: string[] | null
          sustainability_score: number | null
          updated_at: string
        }
        Insert: {
          analyzed?: boolean | null
          company_id: string
          contact_id?: string | null
          content?: string | null
          created_at?: string
          hubspot_id: string
          id?: string
          last_synced_at?: string
          raw_data?: Json | null
          sustainability_keywords?: string[] | null
          sustainability_score?: number | null
          updated_at?: string
        }
        Update: {
          analyzed?: boolean | null
          company_id?: string
          contact_id?: string | null
          content?: string | null
          created_at?: string
          hubspot_id?: string
          id?: string
          last_synced_at?: string
          raw_data?: Json | null
          sustainability_keywords?: string[] | null
          sustainability_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hubspot_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubspot_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          company_id: string
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_leads: {
        Row: {
          commission_amount: number | null
          commission_paid: boolean | null
          commission_paid_at: string | null
          company_id: string | null
          created_at: string | null
          id: string
          message: string | null
          partner_id: string
          recommendation_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          commission_amount?: number | null
          commission_paid?: boolean | null
          commission_paid_at?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          partner_id: string
          recommendation_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          commission_amount?: number | null
          commission_paid?: boolean | null
          commission_paid_at?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          partner_id?: string
          recommendation_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_leads_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "marketplace_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_leads_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "marketplace_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_partners: {
        Row: {
          budget_ranges: string[] | null
          categories: string[] | null
          commission_percentage: number | null
          company_sizes: string[] | null
          contact_email: string
          created_at: string | null
          description: string | null
          id: string
          locations: string[] | null
          logo_url: string | null
          name: string
          services: string[] | null
          status: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          budget_ranges?: string[] | null
          categories?: string[] | null
          commission_percentage?: number | null
          company_sizes?: string[] | null
          contact_email: string
          created_at?: string | null
          description?: string | null
          id?: string
          locations?: string[] | null
          logo_url?: string | null
          name: string
          services?: string[] | null
          status?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          budget_ranges?: string[] | null
          categories?: string[] | null
          commission_percentage?: number | null
          company_sizes?: string[] | null
          contact_email?: string
          created_at?: string | null
          description?: string | null
          id?: string
          locations?: string[] | null
          logo_url?: string | null
          name?: string
          services?: string[] | null
          status?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      marketplace_recommendations: {
        Row: {
          action_plan_type: string | null
          company_id: string | null
          contacted_at: string | null
          created_at: string | null
          id: string
          match_score: number | null
          partner_id: string
          status: string
          user_id: string
        }
        Insert: {
          action_plan_type?: string | null
          company_id?: string | null
          contacted_at?: string | null
          created_at?: string | null
          id?: string
          match_score?: number | null
          partner_id: string
          status?: string
          user_id: string
        }
        Update: {
          action_plan_type?: string | null
          company_id?: string | null
          contacted_at?: string | null
          created_at?: string | null
          id?: string
          match_score?: number | null
          partner_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_recommendations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_recommendations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "marketplace_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      module_completions: {
        Row: {
          completed_at: string | null
          id: string
          is_completed: boolean
          module_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          module_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_completed?: boolean
          module_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          id: string
          sequence_order: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          sequence_order: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          sequence_order?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_applications: {
        Row: {
          budget_ranges: string[] | null
          categories: string[] | null
          company_description: string | null
          company_name: string
          company_sizes: string[] | null
          company_website: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          id: string
          locations: string[] | null
          services_offered: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          budget_ranges?: string[] | null
          categories?: string[] | null
          company_description?: string | null
          company_name: string
          company_sizes?: string[] | null
          company_website?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          locations?: string[] | null
          services_offered?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          budget_ranges?: string[] | null
          categories?: string[] | null
          company_description?: string | null
          company_name?: string
          company_sizes?: string[] | null
          company_website?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          locations?: string[] | null
          services_offered?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_commissions: {
        Row: {
          amount: number
          code_id: string
          created_at: string | null
          id: string
          paid_at: string | null
          partner_id: string
          status: string | null
          subscription_id: string
        }
        Insert: {
          amount: number
          code_id: string
          created_at?: string | null
          id?: string
          paid_at?: string | null
          partner_id: string
          status?: string | null
          subscription_id: string
        }
        Update: {
          amount?: number
          code_id?: string
          created_at?: string | null
          id?: string
          paid_at?: string | null
          partner_id?: string
          status?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_commissions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "promotion_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_snapshots: {
        Row: {
          company_size: string
          created_at: string | null
          id: string
          impact_area: string
          initiative_description: string
          initiative_title: string
          results: string
          sector_id: string | null
        }
        Insert: {
          company_size: string
          created_at?: string | null
          id?: string
          impact_area: string
          initiative_description: string
          initiative_title: string
          results: string
          sector_id?: string | null
        }
        Update: {
          company_size?: string
          created_at?: string | null
          id?: string
          impact_area?: string
          initiative_description?: string
          initiative_title?: string
          results?: string
          sector_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_snapshots_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sector_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_company_admin: boolean | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_company_admin?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_company_admin?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_codes: {
        Row: {
          code: string
          created_at: string | null
          discount_amount: number | null
          discount_percentage: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_partner_code: boolean | null
          max_redemptions: number | null
          partner_id: string | null
          redemption_count: number | null
          stripe_promotion_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_partner_code?: boolean | null
          max_redemptions?: number | null
          partner_id?: string | null
          redemption_count?: number | null
          stripe_promotion_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_partner_code?: boolean | null
          max_redemptions?: number | null
          partner_id?: string | null
          redemption_count?: number | null
          stripe_promotion_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer_text: string
          created_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          sequence_order: number
        }
        Insert: {
          answer_text: string
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id: string
          sequence_order: number
        }
        Update: {
          answer_text?: string
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          sequence_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          content_item_id: string
          created_at: string | null
          id: string
          points: number
          question_text: string
          question_type: string
          sequence_order: number
        }
        Insert: {
          content_item_id: string
          created_at?: string | null
          id?: string
          points?: number
          question_text: string
          question_type: string
          sequence_order: number
        }
        Update: {
          content_item_id?: string
          created_at?: string | null
          id?: string
          points?: number
          question_text?: string
          question_type?: string
          sequence_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          points_required: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          points_required: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          points_required?: number
          updated_at?: string
        }
        Relationships: []
      }
      sector_profiles: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_ai_generated: boolean | null
          key_opportunities: string[]
          key_risks: string[]
          name: string
          procurement_impacts: string[]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id: string
          is_ai_generated?: boolean | null
          key_opportunities?: string[]
          key_risks?: string[]
          name: string
          procurement_impacts?: string[]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_ai_generated?: boolean | null
          key_opportunities?: string[]
          key_risks?: string[]
          name?: string
          procurement_impacts?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_interval: string
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          stripe_price_id: string | null
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          billing_interval: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          stripe_price_id?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_interval?: string
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          stripe_price_id?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sustainability_opportunities: {
        Row: {
          company_id: string
          contact_id: string | null
          created_at: string
          description: string | null
          id: string
          opportunity_score: number
          opportunity_status: string | null
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          opportunity_score?: number
          opportunity_status?: string | null
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          contact_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          opportunity_score?: number
          opportunity_status?: string | null
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sustainability_opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sustainability_opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "hubspot_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          points_earned: number
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points_earned?: number
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_engagement_stats: {
        Row: {
          activity_count: number
          company_id: string | null
          last_active_at: string
          last_login_date: string | null
          level: number
          login_streak: number
          time_spent_seconds: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_count?: number
          company_id?: string | null
          last_active_at?: string
          last_login_date?: string | null
          level?: number
          login_streak?: number
          time_spent_seconds?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_count?: number
          company_id?: string | null
          last_active_at?: string
          last_login_date?: string | null
          level?: number
          login_streak?: number
          time_spent_seconds?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_engagement_stats_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          id: string
          is_completed: boolean
          points_earned: number
          progress_percentage: number
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          id?: string
          is_completed?: boolean
          points_earned?: number
          progress_percentage?: number
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          id?: string
          is_completed?: boolean
          points_earned?: number
          progress_percentage?: number
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          id: string
          points_spent: number
          redeemed_at: string
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          points_spent: number
          redeemed_at?: string
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          points_spent?: number
          redeemed_at?: string
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      value_chains: {
        Row: {
          company_id: string
          created_at: string
          data: Json
          id: string
          is_current: boolean
          name: string
          updated_at: string
          version: number
        }
        Insert: {
          company_id: string
          created_at?: string
          data: Json
          id?: string
          is_current?: boolean
          name: string
          updated_at?: string
          version?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          data?: Json
          id?: string
          is_current?: boolean
          name?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "value_chains_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_profile: {
        Args: { p_id: string; p_email: string; p_role: string }
        Returns: {
          avatar_url: string | null
          bio: string | null
          company_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_company_admin: boolean | null
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      can_access_feature: {
        Args: { feature_name: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_subscription_level: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      record_user_activity_time: {
        Args: { p_user_id: string; p_seconds_active: number }
        Returns: boolean
      }
      update_user_role: {
        Args: { user_id: string; new_role: string }
        Returns: boolean
      }
      user_is_company_admin: {
        Args: { company_id: string }
        Returns: boolean
      }
      user_is_company_member: {
        Args: { company_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "user" | "client_admin" | "consultant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "user", "client_admin", "consultant"],
    },
  },
} as const
