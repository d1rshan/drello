import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ModalProvider } from "@/components/providers/modal-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { currentUser } from "@/lib/server-utils";
import { db } from "@/lib/db";
import { boardMembersTable, boardsTable } from "@/lib/db/schema";
import { getQueryClient } from "@/lib/utils";
import { SiteHeader } from "@/components/sidebar/site-header";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      // TODO: Make this a util ig
      const boards = await db
        .select({
          id: boardsTable.id,
          title: boardsTable.title,
          role: boardMembersTable.role,
        })
        .from(boardsTable)
        .innerJoin(
          boardMembersTable,
          eq(boardsTable.id, boardMembersTable.boardId)
        )
        .where(eq(boardMembersTable.userId, user.id));
      return boards;
    },
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <ModalProvider />
        <AppSidebar
          variant="inset"
          user={{ email: user.email, name: user.name, avatar: user.image! }}
        />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </HydrationBoundary>
  );
}
