"use client";

import { useEffect, useState } from "react";

import { CreateBoardModal } from "@/components/modals/create-board-modal";
import { EditBoardModal } from "@/components/modals/edit-board-modal";
import { DeleteBoardModal } from "@/components/modals/delete-board-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <>
      <CreateBoardModal />
      <EditBoardModal />
      <DeleteBoardModal />
    </>
  );
};
