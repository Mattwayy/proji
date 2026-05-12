'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '../../../src/store/useAppStore';
import type { BusinessDomain } from '../../../src/types';
import { domainNavItems, domainConsultants } from '../../../src/data/domainData';

export default function DomainLandingPage() {
  const params = useParams();
  const router = useRouter();
  const { currentDomain, setCurrentDomain, showDomainWelcome, setShowDomainWelcome } = useAppStore();

  const domainParam = decodeURIComponent(params.domain as string) as BusinessDomain;

  useEffect(() => {
    if (domainParam && domainParam !== currentDomain) {
      setCurrentDomain(domainParam);
    }
  }, [domainParam, currentDomain, setCurrentDomain]);

  const nav = domainNavItems[domainParam] ?? {};
  const consultant = domainConsultants[domainParam] ?? 'AI-консультант';

  const handleNavigate = (label: string) => {
    setShowDomainWelcome({ domain: domainParam, active: false });
    // Find the path from the sidebar ROUTE_MAP equivalents
    const ROUTE_MAP: Record<string, string> = {
      'Чат': '/chat', 'Все сценарии': '/scenarios', 'Agile': '/agile', 'Sprint Review': '/agile/sprint',
      'Сообщения': '/messages', 'Обсуждения': '/discussions', 'Проекты': '/projects',
      'Дерево целей': '/goals-tree', 'Управление проектом': '/projects/manage',
      'Задачи проекта': '/projects/tasks', 'Доска задач': '/board', 'Задачи': '/tasks',
      'Команда': '/team', 'Карта стейкхолдеров': '/stakeholders', 'Профиль сотрудника': '/team/profile',
      'Документы': '/documents', 'Регламенты': '/regulations',
      'Страницы': '/pages-list', 'Дерево страниц': '/pages-tree',
      'Журнал оборудования': '/equipment/journal', 'Доска оборудования': '/equipment/board',
      'Архив ремонтов': '/equipment/archive', 'Журнал проверок': '/equipment/inspections',
      'Схемы ТП': '/equipment/schemes', 'TQM Dashboard': '/tqm', 'TQM DWM Chart': '/tqm/dwm',
      'Непрерывное улучшение': '/tqm/improvement', 'Аудиты качества': '/tqm/audits',
      'Удовлетворенность клиентов': '/tqm/satisfaction', 'Список болей': '/pains',
      'HADI Циклы': '/hadi', 'Юридический Дашборд': '/legal/dashboard',
      'Управленческий Журнал': '/management/journal', 'Управленческий Отчет': '/management/report',
      'Аналитика': '/analytics', 'Отчеты': '/reports', 'Дорожная карта': '/roadmap',
      'OKRs': '/okrs', 'Конкуренты': '/competitors', 'Процессы': '/processes',
      'Ресурсы': '/resources', 'Логистика': '/logistics', 'Кампании': '/campaigns',
      'Лиды': '/leads', 'SEO': '/seo', 'Геймификация': '/gamification',
    };
    const href = ROUTE_MAP[label];
    if (href) router.push(href);
  };

  return (
    <div className="min-h-screen px-4 md:px-12 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-proji-primary/50">Домен</p>
          <h1 className="text-5xl font-black tracking-tight text-proji-dark">{domainParam}</h1>
          <div className="flex items-center gap-2 text-sm text-proji-secondary">
            <Sparkles size={14} className="text-proji-primary" />
            <span>Консультант: <span className="font-bold text-proji-dark">{consultant}</span></span>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center gap-3 px-6 py-4 bg-proji-primary text-white rounded-2xl font-bold text-sm hover:bg-proji-primary/90 transition-all shadow-lg shadow-proji-primary/20"
          >
            <Sparkles size={16} />
            Спросить AI о домене «{domainParam}»
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Nav sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(nav).map(([category, items], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="bg-white rounded-3xl border border-proji-border p-6 space-y-3"
            >
              <p className="text-[10px] uppercase font-black tracking-[0.25em] text-proji-secondary">{category}</p>
              <div className="flex flex-col gap-1">
                {(items as string[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => handleNavigate(item)}
                    className="flex items-center justify-between text-left px-4 py-3 rounded-xl text-sm font-bold text-proji-secondary hover:text-proji-primary hover:bg-proji-primary/5 transition-all group"
                  >
                    <span>{item}</span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
