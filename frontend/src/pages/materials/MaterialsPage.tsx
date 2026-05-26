import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMaterials, uploadMaterial, deleteMaterial } from "@/api/materials";
import { Upload, FileText, Link, Film, Trash2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { MaterialType } from "@/types";

const TYPE_ICONS: Record<MaterialType, React.ElementType> = {
  handout: FileText,
  presentation: FileText,
  exercise: FileText,
  video: Film,
  link: Link,
  other: FileText,
};

export default function MaterialsPage() {
  const [filter, setFilter] = useState("");
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["materials", filter],
    queryFn: () => getMaterials(filter ? { material_type: filter } : {}),
  });

  const deleteMut = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["materials"] }),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("title", file.name);
    form.append("material_type", "handout");
    form.append("visibility", "class");
    await uploadMaterial(form);
    queryClient.invalidateQueries({ queryKey: ["materials"] });
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Class Materials</h1>
        <label className="btn-primary cursor-pointer">
          <Upload size={16} className="mr-2" />
          {uploading ? "Uploading…" : "Upload"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["", "handout", "presentation", "exercise", "video", "link"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === t
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading materials…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((material) => {
            const Icon = TYPE_ICONS[material.material_type] ?? FileText;
            return (
              <div key={material.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{material.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                      {material.material_type}
                    </p>
                    {material.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {material.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">{material.uploaded_by_name}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(material.created_at), "MMM d")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MessageSquare size={12} />
                      {material.comment_count}
                    </span>
                    {material.file && (
                      <a
                        href={material.file}
                        className="text-xs text-blue-600 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    )}
                    <button
                      onClick={() => deleteMut.mutate(material.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
