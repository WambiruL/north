export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
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
      career_experience_skills: {
        Row: {
          experience_id: string
          skill_id: string
          user_id: string
        }
        Insert: {
          experience_id: string
          skill_id: string
          user_id: string
        }
        Update: {
          experience_id?: string
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_experience_skills_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "career_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "career_experience_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      career_experiences: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_current: boolean
          location: string | null
          narrative: string | null
          organization: string
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          narrative?: string | null
          organization: string
          start_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          narrative?: string | null
          organization?: string
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      career_goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      career_milestones: {
        Row: {
          created_at: string
          description: string | null
          experience_id: string | null
          id: string
          occurred_on: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          experience_id?: string | null
          id?: string
          occurred_on?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          experience_id?: string | null
          id?: string
          occurred_on?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_milestones_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "career_experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          created_at: string
          energy: number
          entry_date: string
          id: string
          mood: number
          reflection: string | null
          reflection_prompt: string | null
          sleep_hours: number | null
          stress: number
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy: number
          entry_date?: string
          id?: string
          mood: number
          reflection?: string | null
          reflection_prompt?: string | null
          sleep_hours?: number | null
          stress: number
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy?: number
          entry_date?: string
          id?: string
          mood?: number
          reflection?: string | null
          reflection_prompt?: string | null
          sleep_hours?: number | null
          stress?: number
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
      courses: {
        Row: {
          created_at: string
          id: string
          learning_path_id: string | null
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
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          promoted_project_id?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          promoted_project_id?: string | null
          status?: string
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
      creative_projects: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          linked_work_project_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          linked_work_project_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          linked_work_project_id?: string | null
          status?: string
          title?: string
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
      hobbies: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
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
          hobby_id: string
          id: string
          image_url: string | null
          occurred_on: string
          user_id: string
        }
        Insert: {
          caption: string
          created_at?: string
          hobby_id: string
          id?: string
          image_url?: string | null
          occurred_on?: string
          user_id: string
        }
        Update: {
          caption?: string
          created_at?: string
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
      inspiration_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          note: string | null
          source_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          note?: string | null
          source_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          note?: string | null
          source_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
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
      learning_resources: {
        Row: {
          created_at: string
          id: string
          is_saved_for_later: boolean
          kind: string
          note: string | null
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_saved_for_later?: boolean
          kind?: string
          note?: string | null
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_saved_for_later?: boolean
          kind?: string
          note?: string | null
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      life_areas: {
        Row: {
          belief: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          belief?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          belief?: string | null
          created_at?: string
          id?: string
          name?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          onboarded_at: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id: string
          onboarded_at?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          onboarded_at?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          created_at: string
          id: string
          name: string
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
          id: string
          name: string
          proficiency: number
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          proficiency?: number
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
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
      vision_items: {
        Row: {
          caption: string
          created_at: string
          dream_id: string | null
          id: string
          image_url: string | null
          position: number
          user_id: string
        }
        Insert: {
          caption: string
          created_at?: string
          dream_id?: string | null
          id?: string
          image_url?: string | null
          position?: number
          user_id: string
        }
        Update: {
          caption?: string
          created_at?: string
          dream_id?: string | null
          id?: string
          image_url?: string | null
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
        ]
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
