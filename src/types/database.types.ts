export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          entity_id: string | null
          entity_table: string | null
          id: string
          module: string
          occurred_at: string
          summary: string
          user_id: string
          verb: string
        }
        Insert: {
          entity_id?: string | null
          entity_table?: string | null
          id?: string
          module: string
          occurred_at?: string
          summary: string
          user_id: string
          verb: string
        }
        Update: {
          entity_id?: string | null
          entity_table?: string | null
          id?: string
          module?: string
          occurred_at?: string
          summary?: string
          user_id?: string
          verb?: string
        }
        Relationships: []
      }
      artworks: {
        Row: {
          created_at: string
          dimensions: string | null
          hobby_id: string
          id: string
          image_url: string | null
          medium: string | null
          notes: string | null
          occurred_on: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dimensions?: string | null
          hobby_id: string
          id?: string
          image_url?: string | null
          medium?: string | null
          notes?: string | null
          occurred_on?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dimensions?: string | null
          hobby_id?: string
          id?: string
          image_url?: string | null
          medium?: string | null
          notes?: string | null
          occurred_on?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artworks_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          cover_url: string | null
          created_at: string
          finished_on: string | null
          hobby_id: string
          id: string
          notes: string | null
          rating: number | null
          started_on: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          created_at?: string
          finished_on?: string | null
          hobby_id: string
          id?: string
          notes?: string | null
          rating?: number | null
          started_on?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          created_at?: string
          finished_on?: string | null
          hobby_id?: string
          id?: string
          notes?: string | null
          rating?: number | null
          started_on?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      bucket_list_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          position: number
          status: string
          title: string
          user_id: string
          why: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          position?: number
          status?: string
          title: string
          user_id: string
          why?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          position?: number
          status?: string
          title?: string
          user_id?: string
          why?: string | null
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          created_at: string
          id: string
          monthly_limit: number | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_limit?: number | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_limit?: number | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          category: string | null
          created_at: string
          id: string
          limit_amount: number
          name: string
          note: string | null
          period: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          limit_amount?: number
          name: string
          note?: string | null
          period?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          limit_amount?: number
          name?: string
          note?: string | null
          period?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          issued_on: string
          issuing_org: string | null
          note: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          issued_on?: string
          issuing_org?: string | null
          note?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          issued_on?: string
          issuing_org?: string | null
          note?: string | null
          title?: string
          updated_at?: string
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
      check_ins: {
        Row: {
          challenge: string | null
          created_at: string
          energy: number
          entry_date: string
          feeling: string | null
          grateful: string | null
          id: string
          intention: string | null
          matters_tomorrow: string | null
          mood: number
          sleep_hours: number | null
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge?: string | null
          created_at?: string
          energy: number
          entry_date?: string
          feeling?: string | null
          grateful?: string | null
          id?: string
          intention?: string | null
          matters_tomorrow?: string | null
          mood: number
          sleep_hours?: number | null
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge?: string | null
          created_at?: string
          energy?: number
          entry_date?: string
          feeling?: string | null
          grateful?: string | null
          id?: string
          intention?: string | null
          matters_tomorrow?: string | null
          mood?: number
          sleep_hours?: number | null
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          is_done: boolean
          note: string | null
          position: number
          priority: string | null
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          is_done?: boolean
          note?: string | null
          position?: number
          priority?: string | null
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          is_done?: boolean
          note?: string | null
          position?: number
          priority?: string | null
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          icon_mark: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_mark?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_mark?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cooking_logs: {
        Row: {
          created_at: string
          dish_name: string
          hobby_id: string
          id: string
          note: string | null
          occurred_on: string
          photo_url: string | null
          rating: number | null
          recipe_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dish_name: string
          hobby_id: string
          id?: string
          note?: string | null
          occurred_on?: string
          photo_url?: string | null
          rating?: number | null
          recipe_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dish_name?: string
          hobby_id?: string
          id?: string
          note?: string | null
          occurred_on?: string
          photo_url?: string | null
          rating?: number | null
          recipe_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooking_logs_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooking_logs_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          id: string
          learning_path_id: string | null
          note: string | null
          progress: number
          provider: string | null
          status: string
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          learning_path_id?: string | null
          note?: string | null
          progress?: number
          provider?: string | null
          status?: string
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          learning_path_id?: string | null
          note?: string | null
          progress?: number
          provider?: string | null
          status?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_ideas: {
        Row: {
          created_at: string
          id: string
          note: string | null
          promoted_project_id: string | null
          status: string
          tags: string[]
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          promoted_project_id?: string | null
          status?: string
          tags?: string[]
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          promoted_project_id?: string | null
          status?: string
          tags?: string[]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_ideas_promoted_project_id_fkey"
            columns: ["promoted_project_id"]
            isOneToOne: false
            referencedRelation: "creative_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_moodboards: {
        Row: {
          created_at: string
          id: string
          image_urls: string[]
          note: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_urls?: string[]
          note?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_urls?: string[]
          note?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creative_project_entries: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          project_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          project_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          project_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_project_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "creative_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_projects: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          link_url: string | null
          linked_work_project_id: string | null
          status: string
          title: string
          tools: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          link_url?: string | null
          linked_work_project_id?: string | null
          status?: string
          title: string
          tools?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          link_url?: string | null
          linked_work_project_id?: string | null
          status?: string
          title?: string
          tools?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_projects_linked_work_project_id_fkey"
            columns: ["linked_work_project_id"]
            isOneToOne: false
            referencedRelation: "work_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_goals: {
        Row: {
          created_at: string
          dream_id: string
          id: string
          is_done: boolean
          kind: string
          linked_savings_goal_id: string | null
          target_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dream_id: string
          id?: string
          is_done?: boolean
          kind?: string
          linked_savings_goal_id?: string | null
          target_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          dream_id?: string
          id?: string
          is_done?: boolean
          kind?: string
          linked_savings_goal_id?: string | null
          target_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_goals_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_goals_linked_savings_goal_id_fkey"
            columns: ["linked_savings_goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      dreams: {
        Row: {
          created_at: string
          description: string | null
          goal_statement: string | null
          horizon: string
          id: string
          image_url: string | null
          life_area_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal_statement?: string | null
          horizon?: string
          id?: string
          image_url?: string | null
          life_area_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal_statement?: string | null
          horizon?: string
          id?: string
          image_url?: string | null
          life_area_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dreams_life_area_id_fkey"
            columns: ["life_area_id"]
            isOneToOne: false
            referencedRelation: "life_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_intentions: {
        Row: {
          intention: string
          updated_at: string
          user_id: string
        }
        Insert: {
          intention?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          intention?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          kind: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_reflections: {
        Row: {
          body: string
          created_at: string
          id: string
          occurred_on: string
          prompt: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          occurred_on?: string
          prompt: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          occurred_on?: string
          prompt?: string
          user_id?: string
        }
        Relationships: []
      }
      future_horizons: {
        Row: {
          achieved: string | null
          created_at: string
          feels: string | null
          id: string
          learned: string | null
          position: number
          user_id: string
          when_label: string
          where_text: string
        }
        Insert: {
          achieved?: string | null
          created_at?: string
          feels?: string | null
          id?: string
          learned?: string | null
          position?: number
          user_id: string
          when_label: string
          where_text: string
        }
        Update: {
          achieved?: string | null
          created_at?: string
          feels?: string | null
          id?: string
          learned?: string | null
          position?: number
          user_id?: string
          when_label?: string
          where_text?: string
        }
        Relationships: []
      }
      future_letters: {
        Row: {
          body: string
          created_at: string
          id: string
          prompt: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          prompt: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          prompt?: string
          user_id?: string
        }
        Relationships: []
      }
      hobbies: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          goal: string | null
          id: string
          kind: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          goal?: string | null
          id?: string
          kind?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          goal?: string | null
          id?: string
          kind?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hobby_memories: {
        Row: {
          caption: string
          created_at: string
          duration_minutes: number | null
          fields: Json
          hobby_id: string
          id: string
          image_url: string | null
          occurred_on: string
          user_id: string
        }
        Insert: {
          caption: string
          created_at?: string
          duration_minutes?: number | null
          fields?: Json
          hobby_id: string
          id?: string
          image_url?: string | null
          occurred_on?: string
          user_id: string
        }
        Update: {
          caption?: string
          created_at?: string
          duration_minutes?: number | null
          fields?: Json
          hobby_id?: string
          id?: string
          image_url?: string | null
          occurred_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hobby_memories_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      hobby_notes: {
        Row: {
          body: string
          created_at: string
          hobby_id: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          hobby_id: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          hobby_id?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hobby_notes_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      hobby_projects: {
        Row: {
          created_at: string
          hobby_id: string
          id: string
          notes: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hobby_id: string
          id?: string
          notes?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hobby_id?: string
          id?: string
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hobby_projects_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      income_sources: {
        Row: {
          amount: number
          created_at: string
          frequency: string
          id: string
          kind: string
          last_received_on: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          kind?: string
          last_received_on?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency?: string
          id?: string
          kind?: string
          last_received_on?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inspiration_items: {
        Row: {
          created_at: string
          hobby_id: string | null
          id: string
          image_url: string | null
          kind: string | null
          note: string | null
          source_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hobby_id?: string | null
          id?: string
          image_url?: string | null
          kind?: string | null
          note?: string | null
          source_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          hobby_id?: string | null
          id?: string
          image_url?: string | null
          kind?: string | null
          note?: string | null
          source_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_items_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_holdings: {
        Row: {
          contribution_amount: number | null
          contribution_frequency: string | null
          cost_basis: number | null
          created_at: string
          id: string
          kind: string
          name: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          contribution_amount?: number | null
          contribution_frequency?: string | null
          cost_basis?: number | null
          created_at?: string
          id?: string
          kind?: string
          name: string
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          contribution_amount?: number | null
          contribution_frequency?: string | null
          cost_basis?: number | null
          created_at?: string
          id?: string
          kind?: string
          name?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          due_on: string | null
          id: string
          issued_on: string
          notes: string | null
          paid_amount: number | null
          paid_on: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          work_project_id: string | null
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          due_on?: string | null
          id?: string
          issued_on?: string
          notes?: string | null
          paid_amount?: number | null
          paid_on?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          work_project_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          due_on?: string | null
          id?: string
          issued_on?: string
          notes?: string | null
          paid_amount?: number | null
          paid_on?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          work_project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_work_project_id_fkey"
            columns: ["work_project_id"]
            isOneToOne: false
            referencedRelation: "work_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_curiosities: {
        Row: {
          created_at: string
          id: string
          resources_gathered: string | null
          status: string
          topic: string
          updated_at: string
          user_id: string
          why: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          resources_gathered?: string | null
          status?: string
          topic: string
          updated_at?: string
          user_id: string
          why?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          resources_gathered?: string | null
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string
          why?: string | null
        }
        Relationships: []
      }
      learning_journal_entries: {
        Row: {
          body: string
          created_at: string
          entry_date: string
          id: string
          prompt: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          entry_date?: string
          id?: string
          prompt: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          entry_date?: string
          id?: string
          prompt?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_moments: {
        Row: {
          created_at: string
          id: string
          occurred_on: string
          updated_at: string
          user_id: string
          what: string
        }
        Insert: {
          created_at?: string
          id?: string
          occurred_on?: string
          updated_at?: string
          user_id: string
          what: string
        }
        Update: {
          created_at?: string
          id?: string
          occurred_on?: string
          updated_at?: string
          user_id?: string
          what?: string
        }
        Relationships: []
      }
      learning_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          linked_skill_id: string | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          linked_skill_id?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          linked_skill_id?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_notes_linked_skill_id_fkey"
            columns: ["linked_skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string | null
          id: string
          skill_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          skill_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          skill_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_profile: {
        Row: {
          created_at: string
          focus: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          focus?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          focus?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_projects: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          outcome: string | null
          progress: number
          skills_practised: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          outcome?: string | null
          progress?: number
          skills_practised?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          outcome?: string | null
          progress?: number
          skills_practised?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          author: string | null
          created_at: string
          id: string
          is_saved_for_later: boolean
          kind: string
          note: string | null
          progress_current: number | null
          progress_total: number | null
          status: string
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: string
          is_saved_for_later?: boolean
          kind?: string
          note?: string | null
          progress_current?: number | null
          progress_total?: number | null
          status?: string
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: string
          is_saved_for_later?: boolean
          kind?: string
          note?: string | null
          progress_current?: number | null
          progress_total?: number | null
          status?: string
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          created_at: string
          id: string
          minutes: number
          note: string | null
          occurred_on: string
          skill_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          minutes: number
          note?: string | null
          occurred_on?: string
          skill_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          minutes?: number
          note?: string | null
          occurred_on?: string
          skill_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      life_areas: {
        Row: {
          belief: string | null
          created_at: string
          id: string
          name: string
          practices: string[]
          question: string | null
          user_id: string
        }
        Insert: {
          belief?: string | null
          created_at?: string
          id?: string
          name: string
          practices?: string[]
          question?: string | null
          user_id: string
        }
        Update: {
          belief?: string | null
          created_at?: string
          id?: string
          name?: string
          practices?: string[]
          question?: string | null
          user_id?: string
        }
        Relationships: []
      }
      manifesto_principles: {
        Row: {
          created_at: string
          id: string
          kind: string
          position: number
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          position?: number
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          position?: number
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          body: string
          created_at: string
          id: string
          pinned: boolean
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          tags?: string[]
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_series: {
        Row: {
          created_at: string
          hobby_id: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hobby_id: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          hobby_id?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_series_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          hobby_id: string
          id: string
          image_url: string
          is_favorite: boolean
          location: string | null
          occurred_on: string
          series_id: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          hobby_id: string
          id?: string
          image_url: string
          is_favorite?: boolean
          location?: string | null
          occurred_on?: string
          series_id?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          hobby_id?: string
          id?: string
          image_url?: string
          is_favorite?: boolean
          location?: string | null
          occurred_on?: string
          series_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "photo_series"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_spaces: {
        Row: {
          created_at: string
          id: string
          position: number
          space_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          space_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          space_key?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          currency: string
          full_name: string
          headline: string | null
          id: string
          onboarded_at: string | null
          onboarding_seasons: string[]
          preferences: Json
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          currency?: string
          full_name?: string
          headline?: string | null
          id: string
          onboarded_at?: string | null
          onboarding_seasons?: string[]
          preferences?: Json
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          currency?: string
          full_name?: string
          headline?: string | null
          id?: string
          onboarded_at?: string | null
          onboarding_seasons?: string[]
          preferences?: Json
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_logs: {
        Row: {
          book_id: string
          created_at: string
          id: string
          note: string | null
          occurred_on: string
          page: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          note?: string | null
          occurred_on?: string
          page?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          note?: string | null
          occurred_on?: string
          page?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_logs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_minutes: number | null
          created_at: string
          hobby_id: string
          id: string
          ingredients: string | null
          method: string | null
          name: string
          notes: string | null
          photo_url: string | null
          prep_minutes: number | null
          rating: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cook_minutes?: number | null
          created_at?: string
          hobby_id: string
          id?: string
          ingredients?: string | null
          method?: string | null
          name: string
          notes?: string | null
          photo_url?: string | null
          prep_minutes?: number | null
          rating?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cook_minutes?: number | null
          created_at?: string
          hobby_id?: string
          id?: string
          ingredients?: string | null
          method?: string | null
          name?: string
          notes?: string | null
          photo_url?: string | null
          prep_minutes?: number | null
          rating?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      runs: {
        Row: {
          created_at: string
          distance_km: number
          duration_minutes: number
          feeling: string | null
          hobby_id: string
          id: string
          notes: string | null
          occurred_on: string
          route: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          distance_km: number
          duration_minutes: number
          feeling?: string | null
          hobby_id: string
          id?: string
          notes?: string | null
          occurred_on?: string
          route?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          distance_km?: number
          duration_minutes?: number
          feeling?: string | null
          hobby_id?: string
          id?: string
          notes?: string | null
          occurred_on?: string
          route?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runs_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          id: string
          name: string
          note: string | null
          saved_amount: number
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          note?: string | null
          saved_amount?: number
          target_amount: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          note?: string | null
          saved_amount?: number
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          evidence: string | null
          growth_steps: string[]
          hours_logged: number
          id: string
          level_label: string | null
          name: string
          next_step: string | null
          proficiency: number
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          evidence?: string | null
          growth_steps?: string[]
          hours_logged?: number
          id?: string
          level_label?: string | null
          name: string
          next_step?: string | null
          proficiency?: number
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          evidence?: string | null
          growth_steps?: string[]
          hours_logged?: number
          id?: string
          level_label?: string | null
          name?: string
          next_step?: string | null
          proficiency?: number
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string
          created_at: string
          description: string
          id: string
          mood: string | null
          note: string | null
          occurred_on: string
          user_id: string
          work_project_id: string | null
        }
        Insert: {
          account_id: string
          amount: number
          category?: string
          created_at?: string
          description: string
          id?: string
          mood?: string | null
          note?: string | null
          occurred_on?: string
          user_id: string
          work_project_id?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          mood?: string | null
          note?: string | null
          occurred_on?: string
          user_id?: string
          work_project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_work_project_id_fkey"
            columns: ["work_project_id"]
            isOneToOne: false
            referencedRelation: "work_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_entries: {
        Row: {
          created_at: string
          hobby_id: string
          id: string
          image_urls: string[]
          location: string | null
          notes: string | null
          occurred_on: string | null
          reason: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hobby_id: string
          id?: string
          image_urls?: string[]
          location?: string | null
          notes?: string | null
          occurred_on?: string | null
          reason?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hobby_id?: string
          id?: string
          image_urls?: string[]
          location?: string | null
          notes?: string | null
          occurred_on?: string | null
          reason?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_entries_hobby_id_fkey"
            columns: ["hobby_id"]
            isOneToOne: false
            referencedRelation: "hobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      upcoming_items: {
        Row: {
          amount: number | null
          created_at: string
          due_date: string
          id: string
          is_done: boolean
          kind: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          due_date: string
          id?: string
          is_done?: boolean
          kind?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          due_date?: string
          id?: string
          is_done?: boolean
          kind?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vision_items: {
        Row: {
          caption: string
          created_at: string
          dream_id: string | null
          id: string
          image_url: string | null
          life_area_id: string | null
          position: number
          user_id: string
        }
        Insert: {
          caption: string
          created_at?: string
          dream_id?: string | null
          id?: string
          image_url?: string | null
          life_area_id?: string | null
          position?: number
          user_id: string
        }
        Update: {
          caption?: string
          created_at?: string
          dream_id?: string | null
          id?: string
          image_url?: string | null
          life_area_id?: string | null
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vision_items_dream_id_fkey"
            columns: ["dream_id"]
            isOneToOne: false
            referencedRelation: "dreams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vision_items_life_area_id_fkey"
            columns: ["life_area_id"]
            isOneToOne: false
            referencedRelation: "life_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      work_contacts: {
        Row: {
          created_at: string
          how_met: string | null
          id: string
          last_contact_on: string | null
          name: string
          note: string | null
          organization: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          how_met?: string | null
          id?: string
          last_contact_on?: string | null
          name: string
          note?: string | null
          organization?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          how_met?: string | null
          id?: string
          last_contact_on?: string | null
          name?: string
          note?: string | null
          organization?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          met_with: string | null
          occurred_on: string
          title: string
          user_id: string
          work_project_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          met_with?: string | null
          occurred_on?: string
          title: string
          user_id: string
          work_project_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          met_with?: string | null
          occurred_on?: string
          title?: string
          user_id?: string
          work_project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_notes_work_project_id_fkey"
            columns: ["work_project_id"]
            isOneToOne: false
            referencedRelation: "work_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      work_opportunities: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          kind: string
          note: string | null
          organization: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          kind?: string
          note?: string | null
          organization?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          kind?: string
          note?: string | null
          organization?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_project_skills: {
        Row: {
          skill_id: string
          user_id: string
          work_project_id: string
        }
        Insert: {
          skill_id: string
          user_id: string
          work_project_id: string
        }
        Update: {
          skill_id?: string
          user_id?: string
          work_project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_project_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_project_skills_work_project_id_fkey"
            columns: ["work_project_id"]
            isOneToOne: false
            referencedRelation: "work_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      work_projects: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          linked_goal_id: string | null
          name: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_goal_id?: string | null
          name: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_goal_id?: string | null
          name?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_projects_linked_goal_fk"
            columns: ["linked_goal_id"]
            isOneToOne: false
            referencedRelation: "dream_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      work_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          is_done: boolean
          is_priority: boolean
          position: number
          title: string
          user_id: string
          work_project_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_done?: boolean
          is_priority?: boolean
          position?: number
          title: string
          user_id: string
          work_project_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_done?: boolean
          is_priority?: boolean
          position?: number
          title?: string
          user_id?: string
          work_project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_tasks_work_project_id_fkey"
            columns: ["work_project_id"]
            isOneToOne: false
            referencedRelation: "work_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      work_wins: {
        Row: {
          created_at: string
          id: string
          kind: string | null
          note: string | null
          occurred_on: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string | null
          note?: string | null
          occurred_on?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string | null
          note?: string | null
          occurred_on?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_own_account: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
