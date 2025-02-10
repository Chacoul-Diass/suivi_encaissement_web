import React from 'react';
import Tippy from '@tippyjs/react';
import IconPencil from '@/components/icon/icon-pencil';
import IconEye from '@/components/icon/icon-eye';
import IconMail from '@/components/icon/icon-mail';
import { DataReverse } from '../types';

interface TableActionsProps {
  row: DataReverse;
  hasPermission: (habilitationName: string, permission: string) => boolean;
  handleOpenModal: (row: DataReverse) => void;
  handleOpenViewModal?: (row: DataReverse) => void;
  handleOpenEmailModal?: (row: DataReverse) => void;
}

const TableActions: React.FC<TableActionsProps> = ({
  row,
  hasPermission,
  handleOpenModal,
  handleOpenViewModal,
  handleOpenEmailModal,
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {hasPermission('encaissement', 'update') && (
        <Tippy content="Modifier">
          <button
            type="button"
            className="flex hover:text-info"
            onClick={() => handleOpenModal(row)}
          >
            <IconPencil className="h-5 w-5" />
          </button>
        </Tippy>
      )}
      
      {handleOpenViewModal && (
        <Tippy content="Voir">
          <button
            type="button"
            className="flex hover:text-primary"
            onClick={() => handleOpenViewModal(row)}
          >
            <IconEye className="h-5 w-5" />
          </button>
        </Tippy>
      )}

      {handleOpenEmailModal && hasPermission('encaissement', 'mail') && (
        <Tippy content="Envoyer un mail">
          <button
            type="button"
            className="flex hover:text-success"
            onClick={() => handleOpenEmailModal(row)}
          >
            <IconMail className="h-5 w-5" />
          </button>
        </Tippy>
      )}
    </div>
  );
};

export default TableActions;
