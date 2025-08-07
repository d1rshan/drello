"use client";

import { IconDots, IconEdit, IconLayout, IconTrash } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { deleteBoard, getBoards } from "@/lib/queries/boards";
import { Board } from "@/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NavBoards() {
  const { isMobile } = useSidebar();
  const queryClient = useQueryClient();

  const pathname = usePathname();

  const { data: boards } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
  });

  const { mutate } = useMutation({
    mutationFn: (boardId: string) => deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Boards</SidebarGroupLabel>
      <SidebarMenu>
        {boards.slice(0, 5).map((board: Board) => {
          const isActive = pathname === `/boards/${board.id}`;
          return (
            <SidebarMenuItem key={board.id}>
              <SidebarMenuButton
                asChild
                className={cn(
                  isActive &&
                    "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                )}
              >
                <Link href={`/boards/${board.id}`}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <IconLayout />
                      <span>{board.title}</span>
                    </div>
                  </div>
                </Link>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-accent rounded-sm"
                  >
                    <IconDots />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-24 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <IconEdit />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => mutate(board.id)}
                  >
                    <IconTrash />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          );
        })}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
