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
        {isRefreshing ? (
          <button
            type="button"
            className="btn btn-success flex items-center gap-2"
            disabled
          >
            <span className="h-4 w-4 animate-spin rounded-full border-t-2 border-solid border-white"></span>
            Chargement en cours...
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-success flex items-center gap-2"
            onClick={handleRefresh}
          >
            <IconRefresh /> Actualiser
          </button>
        )}
      </div>
    </>
  );
}
