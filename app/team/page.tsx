'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, CheckCircle2, Clock, Search } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useAppStore } from '../../src/store/useAppStore';

export default function TeamPage() {
  const { currentDomain, allDocs } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Pull team from domain view data via allDocs structure — fallback to static
  const domainTeam = [
    { name: 'Анна К.', role: 'HR', status: 'В сети', avatar: 'АК', tasks: [{ title: 'Онбординг новых лидов', status: 'pending' }, { title: 'Обновление базы знаний', status: 'completed' }] },
    { name: 'Сергей П.', role: 'Admin', status: 'В сети', avatar: 'СП', tasks: [{ title: 'Мониторинг серверов', status: 'pending' }, { title: 'Патч безопасности #12', status: 'completed' }] },
    { name: 'Мария Л.', role: 'Маркетинг', status: 'Оффлайн', avatar: 'МЛ', tasks: [{ title: 'Запуск рекламной кампании', status: 'pending' }] },
    { name: 'Дмитрий В.', role: 'Разработка', status: 'В сети', avatar: 'ДВ', tasks: [{ title: 'Деплой v2.4', status: 'completed' }, { title: 'Code review PR#45', status: 'pending' }] },
    { name: 'Ольга С.', role: 'Финансы', status: 'В сети', avatar: 'ОС', tasks: [{ title: 'Квартальный отчет', status: 'pending' }] },
  ];

  const filtered = domainTeam.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageWrapper>
      <div className="px-4 md:px-12 pb-12 max-w-5xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-proji-border p-4">
            <p className="text-xs font-bold text-proji-secondary uppercase tracking-wide mb-1">Всего</p>
            <p className="text-3xl font-black text-proji-dark">{domainTeam.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-proji-border p-4">
            <p className="text-xs font-bold text-proji-secondary uppercase tracking-wide mb-1">В сети</p>
            <p className="text-3xl font-black text-proji-success">{domainTeam.filter((m) => m.status === 'В сети').length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-proji-border p-4">
            <p className="text-xs font-bold text-proji-secondary uppercase tracking-wide mb-1">Задачи</p>
            <p className="text-3xl font-black text-proji-primary">{domainTeam.reduce((s, m) => s + m.tasks.length, 0)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-proji-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск сотрудников..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-proji-border bg-white text-sm text-proji-dark placeholder:text-proji-secondary focus:outline-none focus:border-proji-primary transition-colors"
          />
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedMember(selectedMember?.name === member.name ? null : member)}
              className={`bg-white rounded-3xl border p-6 cursor-pointer transition-all hover:shadow-md ${selectedMember?.name === member.name ? 'border-proji-primary shadow-md' : 'border-proji-border'}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-proji-primary/10 text-proji-primary font-black text-sm flex items-center justify-center">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-black text-proji-dark">{member.name}</p>
                  <p className="text-xs text-proji-secondary">{member.role}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${member.status === 'В сети' ? 'bg-proji-success/10 text-proji-success' : 'bg-slate-100 text-slate-400'}`}>
                  {member.status}
                </span>
              </div>

              {selectedMember?.name === member.name && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-proji-border pt-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-proji-secondary mb-2">Задачи</p>
                  {member.tasks.map((task, j) => (
                    <div key={j} className="flex items-center gap-2">
                      {task.status === 'completed'
                        ? <CheckCircle2 size={12} className="text-proji-success shrink-0" />
                        : <Clock size={12} className="text-proji-amber shrink-0" />}
                      <span className={`text-xs ${task.status === 'completed' ? 'line-through text-proji-secondary' : 'text-proji-dark'}`}>{task.title}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
