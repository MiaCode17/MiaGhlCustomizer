import { useEffect, useState } from 'react';
import { message } from 'antd';
import { menuEditorService } from '../../../services/menuEditorService';
import { emptyMenuEdit, MenuEdit } from '../../../types/menuEdit';

export function useMenuEdit(groupId: string | undefined) {
  const [menuEdit, setMenuEdit] = useState<MenuEdit>(emptyMenuEdit);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    menuEditorService
      .get(groupId)
      .then((loaded) => {
        if (!cancelled) setMenuEdit(loaded ?? emptyMenuEdit);
      })
      .catch(() => {
        if (!cancelled) message.error('Failed to load menu configuration');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const save = async () => {
    setSaving(true);
    try {
      const saved = await menuEditorService.save(menuEdit, groupId);
      setMenuEdit(saved);
      message.success('Menu configuration saved');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save menu configuration');
    } finally {
      setSaving(false);
    }
  };

  return { menuEdit, setMenuEdit, loading, saving, save };
}
