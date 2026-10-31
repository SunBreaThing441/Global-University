import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import MeridianLessonCard, { LessonModel } from '@meridian/components/molecules/MeridianLessonCard.vue';

describe('MeridianLessonCard (Modern UNESCO Component)', () => {
  const mockLesson: LessonModel = {
    id: 'lesson-uuid-101',
    title: 'Planetary Biodiversity & Climate Science',
    description: 'Explore UNESCO biosphere reserves across the globe.',
    thumbnail: 'https://example.org/biosphere.jpg',
    category: 'Environmental Science',
    is_unesco_heritage: true,
    resources_count: 5,
    due_date: new Date(Date.now() + 86400000 * 3).toISOString(), // Due in 3 days
    progress: {
      status: 'in_progress',
      num_completed: 3,
      total: 5,
    },
  };

  it('renders lesson titles and optional chaining expressions without syntax errors', () => {
    render(MeridianLessonCard, { props: { lesson: mockLesson } });

    expect(screen.getByText('Planetary Biodiversity & Climate Science')).toBeInTheDocument();
    expect(screen.getByText('UNESCO SDG 4')).toBeInTheDocument();
    expect(screen.getByText('60% completed')).toBeInTheDocument();
  });

  it('tolerates missing/partial metadata cleanly using nullish coalescing', () => {
    const sparseLesson: LessonModel = {
      id: 'sparse-1',
      title: 'Elementary Fractions',
    };

    render(MeridianLessonCard, { props: { lesson: sparseLesson } });

    expect(screen.getByText('Elementary Fractions')).toBeInTheDocument();
    expect(screen.getByText('Global Curriculum')).toBeInTheDocument();
    expect(screen.getByText('0% completed')).toBeInTheDocument();
  });

  it('emits select event when clicking the CTA button', async () => {
    const { emitted } = render(MeridianLessonCard, { props: { lesson: mockLesson } });

    const ctaButton = screen.getByRole('button', { name: /resume activity/i });
    await fireEvent.click(ctaButton);

    expect(emitted().select).toBeTruthy();
    expect(emitted().select[0]).toEqual(['lesson-uuid-101']);
  });

  it('toggles bookmark state with accessible aria-pressed updates', async () => {
    const { emitted } = render(MeridianLessonCard, { props: { lesson: mockLesson } });

    const bookmarkBtn = screen.getByRole('button', { name: /bookmark for offline study/i });
    expect(bookmarkBtn).toHaveAttribute('aria-pressed', 'false');

    await fireEvent.click(bookmarkBtn);
    expect(bookmarkBtn).toHaveAttribute('aria-pressed', 'true');
    expect(emitted().bookmark).toBeTruthy();
    expect(emitted().bookmark[0]).toEqual(['lesson-uuid-101', true]);
  });
});
