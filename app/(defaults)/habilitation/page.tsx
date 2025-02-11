"use client";

import dynamic from "next/dynamic";

const ComponentsDragndropSortable = dynamic(
  () => import("@/components/dragndrop/components-dragndrop-sortable"),
  { ssr: false }
);

export default function Profil() {
  return (
    <div>
      <ComponentsDragndropSortable />
    </div>
  );
}
