import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotes, createNote, deleteNote } from "@/api/notes";
import { format } from "date-fns";
import { Plus, StickyNote, Trash2, Globe, Lock, Users } from "lucide-react";
import type { Note } from "@/types";

const VISIBILITY_ICONS = {
  private: Lock,
  class: Users,
  school: Globe,
};

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    visibility: "private" as Note["visibility"],
  });

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: () => getNotes().then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setShowNew(false);
      setNewNote({ title: "", content: "", visibility: "private" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notes</h1>
        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus size={16} className="mr-2" />
          New Note
        </button>
      </div>

      {showNew && (
        <div className="card border-blue-200 border-2">
          <div className="space-y-3">
            <input
              className="input font-medium text-base"
              placeholder="Note title (optional)"
              value={newNote.title}
              onChange={(e) => setNewNote((n) => ({ ...n, title: e.target.value }))}
            />
            <textarea
              className="input resize-none"
              rows={5}
              placeholder="Write your note…"
              value={newNote.content}
              onChange={(e) => setNewNote((n) => ({ ...n, content: e.target.value }))}
            />
            <div className="flex items-center gap-3">
              <select
                className="input w-auto"
                value={newNote.visibility}
                onChange={(e) =>
                  setNewNote((n) => ({ ...n, visibility: e.target.value as Note["visibility"] }))
                }
              >
                <option value="private">Private</option>
                <option value="class">Whole Class</option>
                <option value="school">Whole School</option>
              </select>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setShowNew(false)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => createMut.mutate(newNote)}
                  disabled={!newNote.content.trim() || createMut.isPending}
                  className="btn-primary"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Loading notes…</p>
      ) : notes?.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <StickyNote size={48} className="mx-auto mb-3 opacity-40" />
          <p>No notes yet. Create your first note!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes?.map((note) => {
            const VisIcon = VISIBILITY_ICONS[note.visibility];
            return (
              <div key={note.id} className="card hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm">{note.title || "Untitled note"}</h3>
                  <button
                    onClick={() => deleteMut.mutate(note.id)}
                    className="text-gray-300 hover:text-red-400 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 flex-1 line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>
                {note.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.split(",").map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <VisIcon size={12} />
                    <span className="capitalize">{note.visibility}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(note.updated_at), "MMM d")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
