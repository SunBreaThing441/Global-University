import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import MeridianButton from '@meridian/components/primitives/MeridianButton.vue';

describe('MeridianButton (Accessible Primitive)', () => {
  it('renders accessible label and responds to clicks', async () => {
    const handleClick = vi.fn();
    render(MeridianButton, {
      slots: { default: 'Start Module' },
      attrs: { onClick: handleClick },
    });

    const button = screen.getByRole('button', { name: 'Start Module' });
    await fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables clicks and sets aria-busy when loading', async () => {
    const handleClick = vi.fn();
    render(MeridianButton, {
      props: { loading: true },
      slots: { default: 'Synchronizing...' },
      attrs: { onClick: handleClick },
    });

    const button = screen.getByRole('button', { name: 'Synchronizing...' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    await fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
