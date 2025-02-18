export type Database = {
  public: {
    Tables: {
      notepad: {
        Row: {
          id: string
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          updated_at?: string
        }
      }
    }
  }
}