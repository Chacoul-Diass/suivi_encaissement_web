import React from 'react';
import { useHabilitation } from '@/hooks/useHabilitation';
import IconEdit from '@/components/icon/icon-edit';
import IconMail from '@/components/icon/icon-mail';
import IconTrash from '@/components/icon/icon-trash';
import { MenuName } from '@/types/habilitation';

interface EncaissementActionsProps {
  type: MenuName;
  onEdit?: () => void;
  onDelete?: () => void;
  onMail?: () => void;
}

const EncaissementActions: React.FC<EncaissementActionsProps> = ({
  type,
  onEdit,
  onDelete,
  onMail,
}) => {
  const { hasUpdateAccess, hasDeleteAccess } = useHabilitation();

  return (
    <div className="flex items-center gap-2">
      {hasUpdateAccess(type) && (
        <>
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-gray-600 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
            title="Modifier"
          >
            <IconEdit className="h-5 w-5" />
          </button>
          
          <button
            onClick={onMail}
            className="rounded-lg p-2 text-gray-600 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
            title="Envoyer un mail"
          >
            <IconMail className="h-5 w-5" />
          </button>
        </>
      )}

      {hasDeleteAccess(type) && (
        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-red-500 transition-all duration-300 hover:bg-red-50"
          title="Supprimer"
        >
          <IconTrash className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default EncaissementActions;
