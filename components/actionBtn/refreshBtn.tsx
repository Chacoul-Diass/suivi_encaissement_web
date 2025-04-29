import React from "react";
import IconRefresh from "../icon/icon-refresh";

interface RefreshBtnProps {
  isRefreshing: any;
  handleRefresh: any;
}
export default function RefreshBtn({
  isRefreshing,
  handleRefresh,
}: RefreshBtnProps) {
  return (
    <>
      <div>
        <button
          type="button"
          className="btn btn-success flex items-center gap-2"
          onClick={handleRefresh}
        >
          <IconRefresh /> Actualiser
        </button>
      </div>
    </>
  );
}
