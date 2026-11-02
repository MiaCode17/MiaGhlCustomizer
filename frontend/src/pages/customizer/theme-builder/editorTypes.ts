/** Lets the Make Your Own page own the "Saving for" group so it survives switching theme types. */
export interface EditorGroupProps {
  groupId?: string;
  onGroupChange?: (groupId: string | undefined) => void;
}
