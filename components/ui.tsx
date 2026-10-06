/**
 * LUNARA - UI PRIMITIVES
 * ============================================================================
 * [เนื้อหาที่เรียนรู้ - โมดูลที่ 3: React Components & Reusability]
 * คอมโพเนนต์พื้นฐานที่ใช้ซ้ำทั้งเว็บ: ปุ่ม, ช่องกรอก, ป้าย, กล่องข้อความว่าง, Modal, Sheet
 * ============================================================================
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Minus, Plus, X } from 'lucide-react';

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');
export { cx };

// ----------------------------------------------------------------------------
// Button
// ----------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover shadow-sm',
  secondary: 'bg-surface text-ink border border-line-strong hover:border-gold hover:bg-surface-2',
  ghost: 'text-ink-2 hover:text-ink hover:bg-surface-2',
  danger: 'bg-danger text-white hover:opacity-90',
  gold: 'bg-gold text-white hover:brightness-105 shadow-sm dark:text-bg',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-[0.95rem] gap-2 rounded-2xl',
  lg: 'h-13 px-7 text-base gap-2.5 rounded-2xl',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  block,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={cx(
      'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
      VARIANTS[variant],
      SIZES[size],
      block && 'w-full',
      className
    )}
    {...rest}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }> = ({
  label,
  className,
  children,
  type = 'button',
  ...rest
}) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cx(
      'relative inline-flex items-center justify-center w-10 h-10 rounded-full text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors',
      className
    )}
    {...rest}
  >
    {children}
  </button>
);

// ----------------------------------------------------------------------------
// Badge / Chip
// ----------------------------------------------------------------------------
type Tone = 'neutral' | 'gold' | 'rose' | 'success' | 'danger' | 'warn' | 'info' | 'accent';

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-2 border-line',
  gold: 'bg-gold-soft text-gold border-transparent',
  rose: 'bg-rose-soft text-rose border-transparent',
  success: 'bg-success-soft text-success border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
  warn: 'bg-warn-soft text-warn border-transparent',
  info: 'bg-info-soft text-info border-transparent',
  accent: 'bg-accent text-on-accent border-transparent',
};

export const Badge: React.FC<{ tone?: Tone; className?: string; children: React.ReactNode }> = ({
  tone = 'neutral',
  className,
  children,
}) => (
  <span
    className={cx(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
      TONES[tone],
      className
    )}
  >
    {children}
  </span>
);

/** ปุ่มตัวเลือกแบบเปิด/ปิด (ใช้แทน checkbox ให้กดง่ายบนมือถือ) */
export const ToggleChip: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ active, onClick, children, className }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cx(
      'inline-flex items-center gap-2 px-3.5 h-9 rounded-full text-sm border transition-all',
      active
        ? 'bg-accent text-on-accent border-accent'
        : 'bg-surface text-ink-2 border-line hover:border-gold hover:text-ink',
      className
    )}
  >
    {children}
  </button>
);

// ----------------------------------------------------------------------------
// Form fields
// ----------------------------------------------------------------------------
export const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  htmlFor?: string;
  children: React.ReactNode;
}> = ({ label, required, error, hint, className, htmlFor, children }) => (
  <div className={cx('space-y-1.5', className)}>
    <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
      {label}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
    {children}
    {error ? (
      <p className="text-xs text-danger" role="alert">
        {error}
      </p>
    ) : (
      hint && <p className="text-xs text-ink-3">{hint}</p>
    )}
  </div>
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => <input ref={ref} className={cx('input', className)} {...rest} />
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => <textarea ref={ref} className={cx('input resize-y', className)} {...rest} />
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...rest }, ref) => <select ref={ref} className={cx('input pr-9', className)} {...rest} />
);
Select.displayName = 'Select';

// ----------------------------------------------------------------------------
// Quantity stepper
// ----------------------------------------------------------------------------
export const QuantityStepper: React.FC<{
  value: number;
  onChange: (delta: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  labels: { decrease: string; increase: string };
}> = ({ value, onChange, min = 1, max = 99, size = 'md', labels }) => {
  const btn = size === 'sm' ? 'w-7 h-7' : 'w-10 h-10';
  return (
    <div className="inline-flex items-center rounded-full border border-line-strong bg-surface p-0.5">
      <button
        type="button"
        onClick={() => onChange(-1)}
        disabled={value <= min}
        aria-label={labels.decrease}
        className={cx(btn, 'flex items-center justify-center rounded-full text-ink-2 hover:bg-surface-2 disabled:opacity-30')}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className={cx('text-center font-semibold tabular-nums', size === 'sm' ? 'w-7 text-sm' : 'w-10')}>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(1)}
        disabled={value >= max}
        aria-label={labels.increase}
        className={cx(btn, 'flex items-center justify-center rounded-full text-ink-2 hover:bg-surface-2 disabled:opacity-30')}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Page / section headers & empty state
// ----------------------------------------------------------------------------
export const PageHeader: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  center?: boolean;
}> = ({ eyebrow, title, subtitle, action, center }) => (
  <div
    className={cx(
      'flex flex-col gap-4',
      center ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
    )}
  >
    <div className={cx('space-y-2', center && 'max-w-2xl')}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] text-ink">{title}</h1>
      {subtitle && <p className="text-ink-2 text-[0.95rem] sm:text-base max-w-2xl">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const SectionHeader: React.FC<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ eyebrow, title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
    <div className="space-y-1.5">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2 className="text-2xl sm:text-3xl text-ink">{title}</h2>
      {subtitle && <p className="text-ink-2 text-sm sm:text-base">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="card text-center px-6 py-14 sm:py-16 max-w-lg mx-auto">
    <div className="w-16 h-16 mx-auto rounded-full bg-surface-2 text-gold flex items-center justify-center mb-5">
      {icon}
    </div>
    <h3 className="text-xl text-ink mb-2">{title}</h3>
    {description && <p className="text-sm text-ink-2 mb-6 max-w-sm mx-auto">{description}</p>}
    {action}
  </div>
);

export const Container: React.FC<{ className?: string; children: React.ReactNode; narrow?: boolean }> = ({
  className,
  children,
  narrow,
}) => <div className={cx('mx-auto px-4 sm:px-6 lg:px-8', narrow ? 'max-w-5xl' : 'max-w-7xl', className)}>{children}</div>;

// ----------------------------------------------------------------------------
// Overlay helpers: Modal & Sheet (ล็อกการเลื่อนหน้า + ปิดด้วยปุ่ม Esc)
// ----------------------------------------------------------------------------
// เก็บลำดับหน้าต่างที่เปิดซ้อนกัน เพื่อให้ปุ่ม Esc ปิดเฉพาะหน้าต่างบนสุด
const overlayStack: symbol[] = [];

function useOverlay(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const id = Symbol('overlay');
    overlayStack.push(id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && overlayStack[overlayStack.length - 1] === id) onCloseRef.current();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      overlayStack.splice(overlayStack.indexOf(id), 1);
      if (overlayStack.length === 0) document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
}

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: string;
  closeLabel: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}> = ({ open, onClose, title, closeLabel, size = 'md', children }) => {
  useOverlay(open, onClose);
  if (!open) return null;
  const width = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl';
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        className={cx(
          'relative w-full bg-surface border border-line shadow-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto animate-slide-up sm:animate-pop',
          width
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 pt-5 pb-3 bg-surface">
          <h3 className="text-xl text-ink">{title}</h3>
          <IconButton label={closeLabel} onClick={onClose} className="-mr-2">
            <X className="w-5 h-5" />
          </IconButton>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export const Sheet: React.FC<{
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  title?: React.ReactNode;
  closeLabel: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({ open, onClose, side = 'right', title, closeLabel, footer, children }) => {
  useOverlay(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        className={cx(
          'absolute inset-y-0 w-full max-w-md bg-bg border-line shadow-2xl flex flex-col',
          side === 'right' ? 'right-0 border-l animate-slide-in-right' : 'left-0 border-r animate-slide-in-left'
        )}
      >
        <div className="flex items-center justify-between gap-4 px-5 h-16 border-b border-line bg-surface shrink-0">
          <div className="min-w-0">{title}</div>
          <IconButton label={closeLabel} onClick={onClose}>
            <X className="w-5 h-5" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-line bg-surface p-5 shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 className={cx('w-6 h-6 animate-spin text-gold', className)} />
);

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cx('animate-pulse rounded-xl bg-surface-3', className)} />
);

/** หน้าต่างยืนยันก่อนทำรายการที่ย้อนกลับไม่ได้ (เช่น ลบสินค้าออกจากตะกร้า) */
export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}> = ({ open, title, message, confirmLabel, cancelLabel, closeLabel, busy, onConfirm, onClose, children }) => (
  <Modal open={open} onClose={onClose} title={title} closeLabel={closeLabel} size="sm">
    <div className="space-y-5">
      {children}
      {message && <p className="text-sm text-ink-2">{message}</p>}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant="danger" loading={busy} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);
