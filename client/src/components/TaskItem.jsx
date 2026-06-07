import { format } from 'date-fns';

const PRIORITY_STYLE = {
  HIGH: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  LOW: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};
const PRIORITY_LABEL = { HIGH: '상', MEDIUM: '중', LOW: '하' };

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  return (
    <li className="card flex items-start gap-3">
      <input
        type="checkbox"
        className="mt-1 h-5 w-5 accent-brand-600"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label="완료 처리"
      />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${PRIORITY_STYLE[task.priority]}`}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          <span
            className={`text-base font-medium ${
              task.completed ? 'line-through text-slate-400' : ''
            }`}
          >
            {task.title}
          </span>
        </div>
        {task.description && (
          <p className="mt-1 text-sm text-slate-500">{task.description}</p>
        )}
        {task.dueAt && (
          <p className="mt-1 text-xs text-slate-500">
            마감 {format(new Date(task.dueAt), 'yyyy-MM-dd HH:mm')}
          </p>
        )}
      </div>
      <div className="flex gap-1">
        <button className="btn-ghost text-xs" onClick={() => onEdit(task)}>수정</button>
        <button className="btn-ghost text-xs text-rose-600" onClick={() => onDelete(task)}>삭제</button>
      </div>
    </li>
  );
}
