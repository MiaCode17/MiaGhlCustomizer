import { FloatingButtonsByPosition } from './FloatingButtonsByPosition';

export function FloatingBottomButtonPage() {
  return (
    <FloatingButtonsByPosition
      positions={['bottom', 'top']}
      description="Add floating buttons along the bottom or top of the screen. They can open a drawer with tabs, a pop-up or a page, be dragged by viewers, and run for a limited time."
    />
  );
}
