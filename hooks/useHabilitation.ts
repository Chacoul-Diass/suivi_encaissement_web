import { useState, useEffect } from 'react';
import { Habilitation, MenuName, HabilitationAction } from '@/types/habilitation';
import getUserHabilitation from '@/utils/getHabilitation';

export const useHabilitation = () => {
  const [habilitations, setHabilitations] = useState<Habilitation[]>([]);

  useEffect(() => {
    const userHabilitations = getUserHabilitation();
    setHabilitations(userHabilitations || []);
  }, []);

  const hasAccess = (menuName: MenuName, action: HabilitationAction): boolean => {
    const menu = habilitations.find(h => h.name === menuName);
    return menu ? menu[action] : false;
  };

  const hasReadAccess = (menuName: MenuName): boolean => {
    return hasAccess(menuName, 'LIRE');
  };

  const hasCreateAccess = (menuName: MenuName): boolean => {
    return hasAccess(menuName, 'CREER');
  };

  const hasUpdateAccess = (menuName: MenuName): boolean => {
    return hasAccess(menuName, 'MODIFIER');
  };

  const hasDeleteAccess = (menuName: MenuName): boolean => {
    return hasAccess(menuName, 'SUPPRIMER');
  };

  return {
    hasReadAccess,
    hasCreateAccess,
    hasUpdateAccess,
    hasDeleteAccess,
    habilitations
  };
};

export default useHabilitation;
