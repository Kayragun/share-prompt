export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          profession: string | null;
          education: string | null;
          description: string | null;
          show_profession: boolean;
          show_education: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      categories: {
        Row: {
          id: number;
          slug: string;
          name_tr: string;
          name_en: string;
          icon: string | null;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          description: string | null;
          category_id: number;
          parent_id: string | null;
          star_count: number;
          fork_count: number;
          token_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prompts']['Row'], 'id' | 'star_count' | 'fork_count' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['prompts']['Insert']>;
      };
      prompt_outputs: {
        Row: {
          id: string;
          prompt_id: string;
          type: 'text' | 'image' | 'video';
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prompt_outputs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['prompt_outputs']['Insert']>;
      };
      prompt_stars: {
        Row: {
          user_id: string;
          prompt_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prompt_stars']['Row'], 'created_at'>;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Prompt = Database['public']['Tables']['prompts']['Row'];
export type PromptOutput = Database['public']['Tables']['prompt_outputs']['Row'];
export type PromptStar = Database['public']['Tables']['prompt_stars']['Row'];

export type PromptWithDetails = Prompt & {
  profiles: Pick<Profile, 'username' | 'full_name' | 'avatar_url'>;
  categories: Pick<Category, 'slug' | 'name_tr' | 'name_en' | 'icon'>;
  prompt_outputs?: PromptOutput[];
};
