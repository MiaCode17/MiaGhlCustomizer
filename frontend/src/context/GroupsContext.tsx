import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { groupService } from '../services/groupService';
import { useSession } from './SessionContext';
import { Group, GroupInput } from '../types/group';

interface GroupsContextValue {
  groups: Group[];
  isLoading: boolean;
  createGroup: (input: GroupInput) => Promise<void>;
  updateGroup: (id: string, input: GroupInput) => Promise<void>;
  removeGroup: (id: string) => Promise<void>;
}

const GroupsContext = createContext<GroupsContextValue | undefined>(undefined);

/** The agency's location groups, shared by the Groups page and every page's group selector. */
export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    groupService
      .list()
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setIsLoading(false));
  }, [user]);

  const createGroup = useCallback(async (input: GroupInput) => {
    const created = await groupService.create(input);
    setGroups((prev) => [...prev, created]);
  }, []);

  const updateGroup = useCallback(async (id: string, input: GroupInput) => {
    const updated = await groupService.update(id, input);
    setGroups((prev) => prev.map((g) => (g._id === id ? updated : g)));
  }, []);

  const removeGroup = useCallback(async (id: string) => {
    await groupService.remove(id);
    setGroups((prev) => prev.filter((g) => g._id !== id));
  }, []);

  const value = useMemo(
    () => ({ groups, isLoading, createGroup, updateGroup, removeGroup }),
    [groups, isLoading, createGroup, updateGroup, removeGroup],
  );

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
}

export function useGroups(): GroupsContextValue {
  const ctx = useContext(GroupsContext);
  if (!ctx) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return ctx;
}
