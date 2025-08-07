"use client";

import { useEffect, useState } from "react";

import { CreateBoardModal } from "@/components/modals/create-board-modal";

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
    </>
  );
};
