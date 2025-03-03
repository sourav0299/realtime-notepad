"use client"

import { Button } from "@/components/ui/button";
import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AlertDialogDemo } from "../components/DialogBox";

interface NotepadRow {
    id: string;
    content: string;
  }

export default function allnotepads(){
    const router = useRouter();
    const [notepads, setNotepads] = useState<NotepadRow[]>([]);

    const fetchNotepads = async () => {
        const { data, error } = await supabase.from("notepad").select("id, content");
        if(error){
            toast.error("Error fetching notepads");
        }else{
            setNotepads(data);
        }
    }

    const deleteNotepad = async (id: string) => {
        try {
          const { error } = await supabase.from("notepad").delete().eq("id", id);
    
          if (error) {
            console.error("Error deleting notepad:", error);
            toast.error("Failed to delete notepad");
          } else {
            setNotepads((prevNotepads) =>
              prevNotepads.filter((notepad) => notepad.id !== id)
            );
            toast.success("Notepad deleted successfully");
            await fetchNotepads();
          }
        } catch (err) {
          console.error("Error in deleteNotepad:", err);
          toast.error("Something went wrong while deleting");
        }
      };

      useEffect(() => {
        fetchNotepads();
      }, [])

    return (
        <div className="min-h-screen w-full flex flex-col items-center p-4 sm:p-6">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">All Notepads</h1>
          
          
            <ul className="space-y-3">
              {notepads.map((notepad) => (
                <li
                  key={notepad.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-white dark:bg-black rounded-lg shadow gap-3"
                >
                  <span className="text-sm sm:text-base break-all">
                    {notepad.id}
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="link"
                      onClick={() => router.push(`/notepad/${notepad.id}`)}
                      className="flex-1 sm:flex-none"
                    >
                      Visit
                    </Button>
                    <AlertDialogDemo
                      onConfirm={() => deleteNotepad(notepad.id)}
                      trigger={
                        <Button
                          variant="destructive"
                          className="flex-1 sm:flex-none"
                        >
                          Delete
                        </Button>
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
        </div>
      </div>
        
    )
}