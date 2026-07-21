"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, ListTree } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { MaterialItemFormDialog } from "@/components/templates/material-item-form-dialog";
import { DeleteMaterialItemDialog } from "@/components/templates/delete-material-item-dialog";
import { useMaterialItems, materialSpecStore } from "@/lib/store/material-spec-store";
import { toastStore } from "@/lib/store/toast-store";
import { getCurrentUser } from "@/lib/session";
import type { MaterialCategory, MaterialItem } from "@/lib/mock/material-spec";

export function MaterialCategoryList({ category }: { category: MaterialCategory }) {
  const currentUser = getCurrentUser();
  const canEdit = currentUser.role === "super-admin" || currentUser.role === "admin";
  const canDelete = currentUser.role === "super-admin";

  const items = useMaterialItems(category.key);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MaterialItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaterialItem | null>(null);

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.description.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    const deleted = deleteTarget;
    materialSpecStore.deleteItem(deleted.id);
    setDeleteTarget(null);
    toastStore.show(`"${deleted.name}" deleted`, "success", {
      durationMs: 10000,
      action: { label: "Undo", onClick: () => materialSpecStore.restoreItem(deleted.id) },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-grey-900">{category.label}</h3>
          <p className="text-xs font-body text-grey-400">{items.length} entries</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add {category.label}
        </Button>
      </div>

      {items.length > 5 && (
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${category.label.toLowerCase()}`}
            className="w-full rounded-lg border border-grey-100 bg-card py-2 pl-9 pr-3 text-sm font-body text-grey-900 outline-none focus:border-primary"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListTree}
          message={items.length === 0 ? `No ${category.label.toLowerCase()} entries yet.` : "No entries match your search."}
          cta={items.length === 0 ? { label: `Add ${category.label}`, onClick: () => setAddOpen(true) } : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-grey-100">
          <table className="w-full text-left">
            <thead className="bg-light-600">
              <tr>
                <th className="px-4 py-2.5 text-xs font-body font-medium uppercase tracking-wide text-grey-500">
                  {category.longDescription ? "Value" : "Name"}
                </th>
                {!category.longDescription && (
                  <th className="px-4 py-2.5 text-xs font-body font-medium uppercase tracking-wide text-grey-500">
                    Description
                  </th>
                )}
                <th className="px-4 py-2.5 text-right text-xs font-body font-medium uppercase tracking-wide text-grey-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-t border-grey-100">
                  <td className="px-4 py-3 text-sm font-body text-grey-900">
                    {i.name}
                    {category.longDescription && i.description && (
                      <p className="mt-0.5 text-xs font-body text-grey-400">{i.description}</p>
                    )}
                  </td>
                  {!category.longDescription && (
                    <td className="px-4 py-3 text-sm font-body text-grey-500">{i.description || "—"}</td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <Tooltip>
                          <TooltipTrigger
                            aria-label="Edit"
                            onClick={() => setEditTarget(i)}
                            className="rounded-md p-1.5 text-grey-400 transition-colors hover:bg-light-600 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      )}
                      {canDelete && (
                        <Tooltip>
                          <TooltipTrigger
                            aria-label="Delete"
                            onClick={() => setDeleteTarget(i)}
                            className="rounded-md p-1.5 text-grey-400 transition-colors hover:bg-light-600 hover:text-error"
                          >
                            <Trash2 className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MaterialItemFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        category={category}
        onSubmit={(values) => materialSpecStore.createItem({ category: category.key, ...values })}
      />

      {editTarget && (
        <MaterialItemFormDialog
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          category={category}
          item={editTarget}
          onSubmit={(values) => materialSpecStore.updateItem(editTarget.id, values)}
        />
      )}

      <DeleteMaterialItemDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        category={category}
        item={deleteTarget}
        onConfirm={handleDelete}
      />
    </div>
  );
}
