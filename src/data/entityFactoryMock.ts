export type EntityType = 'note' | 'task' | 'event';

export interface AiFragment {
  id: string;
  text: string;
  suggested: EntityType;
  context?: string;
}

export interface AiResponse {
  summary: string;
  fragments: AiFragment[];
}

/** Simulate POST /api/ai/parse — returns structured fragments after a delay */
export async function mockAiParse(_input: string): Promise<AiResponse> {
  await new Promise((r) => setTimeout(r, 2200));

  return {
    summary: 'Обнаружены задачи, события и идеи для фиксации.',
    fragments: [
      {
        id: 'f1',
        text: 'Провести встречу с командой по итогам квартала',
        suggested: 'task',
        context: 'Действие требует исполнителя и срока',
      },
      {
        id: 'f2',
        text: 'Показатели продаж снизились на 12% в марте — зафиксировать причину',
        suggested: 'event',
        context: 'Произошедшее событие, требует отчёта',
      },
      {
        id: 'f3',
        text: 'Идея: реферальная программа для существующих клиентов',
        suggested: 'note',
        context: 'Гипотеза / идея для сохранения',
      },
      {
        id: 'f4',
        text: 'Согласовать бюджет Q3 с финансовым отделом до 15-го числа',
        suggested: 'task',
        context: 'Конкретное действие с дедлайном',
      },
      {
        id: 'f5',
        text: 'Клиент «Альфа Групп» дал позитивный отзыв после закрытия проекта',
        suggested: 'event',
        context: 'Завершённое событие — стоит зафиксировать',
      },
      {
        id: 'f6',
        text: 'Рассмотреть переход на новую CRM-систему в следующем квартале',
        suggested: 'note',
        context: 'Идея на будущее',
      },
    ],
  };
}
