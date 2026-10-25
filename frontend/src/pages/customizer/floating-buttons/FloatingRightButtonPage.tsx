import { FloatingButtonsByPosition } from './FloatingButtonsByPosition';

export function FloatingRightButtonPage() {
  return (
    <FloatingButtonsByPosition
      positions={['right', 'left']}
      description="Add floating buttons on the sides of the screen. They can open a drawer with tabs, a pop-up or a page, be dragged by viewers, and run for a limited time."
    />
  );
}
