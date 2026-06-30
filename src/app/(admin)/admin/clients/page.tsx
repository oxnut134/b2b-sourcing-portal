import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { Users, Building2 } from "lucide-react";

export default async function AdminClientsPage() {
  const clients = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      company: users.company,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "client"))
    .orderBy(desc(users.createdAt));

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-lg font-semibold text-[#f1f5f9]">Clients</h1>
        <p className="text-sm text-[#94a3b8] mt-0.5">
          {clients.length} registered client{clients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[rgba(148,163,184,0.15)] border-dashed bg-[#253448]/30 py-20 text-center">
          <Users className="h-10 w-10 text-[#475569] mb-3" />
          <p className="text-sm text-[#94a3b8]">No clients yet</p>
          <p className="text-sm text-[#64748b] mt-1">Clients will appear here after they register</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => {
            const initial = (client.name ?? client.email ?? "?").charAt(0).toUpperCase();
            return (
              <div key={client.id} className="flex items-center justify-between rounded-xl border border-[rgba(148,163,184,0.18)] bg-[#253448]/50 px-5 py-4 hover:border-[rgba(148,163,184,0.25)] hover:bg-[#2d3c52] transition-all duration-150">
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 text-sm font-bold text-indigo-400">
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e2e8f0]">{client.name ?? "—"}</p>
                    <p className="text-sm text-[#94a3b8]">{client.email}</p>
                    {client.company && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-[#475569]" />
                        <p className="text-xs text-[#64748b]">{client.company}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#64748b]">Joined</p>
                  <p className="text-sm text-[#94a3b8]">{formatDate(client.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
