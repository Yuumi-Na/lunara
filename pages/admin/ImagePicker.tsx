/**
 * LUNARA - ADMIN: IMAGE FOLDER BROWSER & PICKERS
 * ============================================================================
 * เรียกใช้รูปจากโฟลเดอร์ img/ ของโปรเจกต์ (มีโฟลเดอร์ย่อยได้ เช่น "หินมงคล 777")
 * - เปิดดูโฟลเดอร์ / โฟลเดอร์ย่อย
 * - อัปโหลดรูปจากคอมพิวเตอร์ลงโฟลเดอร์ที่เปิดอยู่ (กดเลือกไฟล์ หรือ ลากไฟล์มาวาง)
 * - รองรับเฉพาะ JPG / PNG / WEBP ไม่เกิน 5 MB (รูปใหญ่ย่ออัตโนมัติไม่เกิน 1600px)
 * - สร้างโฟลเดอร์ใหม่ / ลบรูป / ลบโฟลเดอร์ว่าง / คัดลอกลิงก์
 * ============================================================================
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronRight, Copy, Folder, FolderPlus, HardDrive, ImagePlus, Images, Link2, Trash2, Upload, X } from 'lucide-react';
import * as api from '../../services/api';
import type { MediaFile, MediaListing } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ProductImage } from '../../components/ProductCard';
import { Badge, Button, cx, Input, Modal, Skeleton, Spinner } from '../../components/ui';
import { useI18n } from '../../i18n';

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
/** ค่าสำหรับ <input type="file" accept="..."> */
export const ACCEPT_ATTR = [...ACCEPTED_TYPES, ...ACCEPTED_EXT].join(',');
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1600;

function isAccepted(file: File): boolean {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXT.includes(ext);
}

/** ย่อรูปที่ใหญ่เกินไปด้วย canvas ก่อนอัปโหลด (บันทึกเป็น WEBP เพื่อให้ไฟล์เล็กลง) */
async function prepareImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= 1.5 * 1024 * 1024) return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
}

export function useImageUpload() {
  const toast = useToast();
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);

  const upload = async (files: FileList | File[], dir = ''): Promise<MediaFile[]> => {
    const uploaded: MediaFile[] = [];
    setUploading(true);
    try {
      for (const original of Array.from(files)) {
        if (!isAccepted(original)) {
          toast(t('media.badType', { name: original.name }), 'error');
          continue;
        }
        const file = await prepareImage(original);
        if (file.size > MAX_BYTES) {
          toast(t('media.tooLarge', { name: original.name }), 'error');
          continue;
        }
        try {
          uploaded.push(await api.uploadImage(file, dir));
        } catch (err) {
          const code = err instanceof api.ApiError ? err.code : '';
          toast(code === 'UNSUPPORTED_TYPE' ? t('media.badType', { name: original.name }) : t('media.uploadFailed'), 'error');
        }
      }
      if (uploaded.length) toast(t('media.uploaded', { count: uploaded.length }));
    } finally {
      setUploading(false);
    }
    return uploaded;
  };

  return { upload, uploading };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ============================================================================
// FOLDER BROWSER — ใช้ทั้งหน้า "คลังรูปภาพ" (manage) และหน้าต่างเลือกรูป (select)
// ============================================================================
interface FolderBrowserProps {
  mode: 'manage' | 'select';
  selected?: string[];
  onToggleSelect?: (url: string) => void;
  /** แจ้งเมื่ออัปโหลดเสร็จ (โหมด select ใช้เลือกรูปที่เพิ่งอัปโหลดให้อัตโนมัติ) */
  onUploaded?: (files: MediaFile[]) => void;
}

const LAST_DIR_KEY = 'lunara_media_dir';

export const FolderBrowser: React.FC<FolderBrowserProps> = ({ mode, selected = [], onToggleSelect, onUploaded }) => {
  const { t, date } = useI18n();
  const toast = useToast();
  const [dir, setDir] = useState<string>(() => {
    try {
      return localStorage.getItem(LAST_DIR_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [listing, setListing] = useState<MediaListing | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [deleting, setDeleting] = useState<{ path: string; name: string; usedBy?: number; folder?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useImageUpload();

  const load = useCallback(
    (target: string) => {
      setListing(null);
      api
        .fetchMedia(target)
        .then((data) => {
          setListing(data);
          try {
            localStorage.setItem(LAST_DIR_KEY, data.dir);
          } catch {
            /* ignore */
          }
        })
        .catch(() => {
          // โฟลเดอร์ที่จำไว้ถูกลบไปแล้ว -> กลับไปโฟลเดอร์หลัก
          if (target) setDir('');
          else setListing({ dir: '', folders: [], files: [] });
        });
    },
    []
  );

  useEffect(() => load(dir), [dir, load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const added = await upload(files, dir);
    if (added.length) {
      load(dir);
      onUploaded?.(added);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    try {
      const folder = await api.createFolder(dir, folderName.trim());
      setNewFolderOpen(false);
      setFolderName('');
      toast(t('media.folderCreated', { name: folder.name }));
      setDir(folder.path);
    } catch (err) {
      const code = err instanceof api.ApiError ? err.code : '';
      toast(code === 'EXISTS' ? t('media.folderExists') : t('admin.saveFailed'), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteMedia(deleting.path);
      toast(deleting.folder ? t('media.folderDeleted') : t('media.deleted'));
      setDeleting(null);
      load(dir);
    } catch (err) {
      const code = err instanceof api.ApiError ? err.code : '';
      toast(code === 'NOT_EMPTY' ? t('media.folderNotEmpty') : t('admin.deleteFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
      toast(t('media.copied'));
    } catch {
      toast(url, 'info');
    }
  };

  const crumbs = dir ? dir.split('/') : [];
  const totalSize = listing?.files.reduce((s, f) => s + f.size, 0) ?? 0;
  const isEmpty = listing && listing.folders.length === 0 && listing.files.length === 0;

  return (
    <div
      className="space-y-4"
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      {/* Toolbar: breadcrumb + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav aria-label={t('media.location')} className="flex items-center flex-wrap gap-1 text-sm min-w-0">
          <button
            type="button"
            onClick={() => setDir('')}
            className={cx('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-surface-2', !dir ? 'text-ink font-medium' : 'text-ink-2')}
          >
            <HardDrive className="w-4 h-4 text-gold" />
            img
          </button>
          {crumbs.map((name, i) => {
            const target = crumbs.slice(0, i + 1).join('/');
            const last = i === crumbs.length - 1;
            return (
              <React.Fragment key={target}>
                <ChevronRight className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                <button
                  type="button"
                  onClick={() => setDir(target)}
                  className={cx('px-2 py-1 rounded-lg hover:bg-surface-2 truncate max-w-[12rem]', last ? 'text-ink font-medium' : 'text-ink-2')}
                >
                  {name}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={() => setNewFolderOpen((o) => !o)}>
            <FolderPlus className="w-4 h-4" />
            {t('media.newFolder')}
          </Button>
          <Button size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload className="w-4 h-4" />
            {t('media.uploadFromDevice')}
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {newFolderOpen && (
        <form onSubmit={handleCreateFolder} className="flex gap-2 animate-fade-up">
          <Input
            autoFocus
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder={t('media.folderName')}
            aria-label={t('media.folderName')}
            maxLength={80}
          />
          <Button type="submit" disabled={!folderName.trim()}>
            {t('media.create')}
          </Button>
          <Button variant="ghost" onClick={() => setNewFolderOpen(false)}>
            {t('common.cancel')}
          </Button>
        </form>
      )}

      {/* Drop zone hint */}
      <div
        className={cx(
          'rounded-2xl border-2 border-dashed px-4 py-3 text-center text-xs transition-colors',
          dragOver ? 'border-gold bg-gold-soft/50 text-ink' : 'border-line text-ink-3'
        )}
      >
        {uploading ? <Spinner className="w-5 h-5 mx-auto" /> : t('media.dropHint')}
      </div>

      {listing && (
        <p className="text-xs text-ink-3">
          {t('media.summary', { folders: listing.folders.length, count: listing.files.length, size: formatBytes(totalSize) })}
        </p>
      )}

      {/* Folders + files */}
      {listing === null ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="py-12 text-center space-y-1">
          <Images className="w-8 h-8 mx-auto text-ink-3" />
          <p className="text-sm text-ink-2">{t('media.folderEmpty')}</p>
          <p className="text-xs text-ink-3">{t('media.emptyDesc')}</p>
        </div>
      ) : (
        <div className={cx('grid gap-3', mode === 'select' ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5')}>
          {listing.folders.map((folder) => (
            <div key={folder.path} className="relative group">
              <button
                type="button"
                onClick={() => setDir(folder.path)}
                className="w-full aspect-square rounded-2xl border border-line bg-surface-2 hover:border-gold flex flex-col items-center justify-center gap-2 p-3 text-center transition-colors"
              >
                <Folder className="w-10 h-10 text-gold fill-gold-soft" />
                <span className="text-sm font-medium text-ink line-clamp-2 break-all">{folder.name}</span>
                <span className="text-[11px] text-ink-3">{t('media.imageCount', { count: folder.count })}</span>
              </button>
              {mode === 'manage' && folder.count === 0 && (
                <button
                  type="button"
                  onClick={() => setDeleting({ path: folder.path, name: folder.name, folder: true })}
                  aria-label={t('common.delete')}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-surface text-ink-3 hover:text-danger flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {listing.files.map((file) =>
            mode === 'select' ? (
              <button
                key={file.path}
                type="button"
                onClick={() => onToggleSelect?.(file.url)}
                aria-pressed={selected.includes(file.url)}
                title={file.name}
                className={cx(
                  'relative aspect-square rounded-2xl overflow-hidden border-2 transition-colors',
                  selected.includes(file.url) ? 'border-gold' : 'border-transparent hover:border-line-strong'
                )}
              >
                <img src={file.url} alt={file.name} loading="lazy" className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[10px] px-2 py-1 truncate text-left">
                  {file.name}
                </span>
                {selected.includes(file.url) && (
                  <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            ) : (
              <figure key={file.path} className="card overflow-hidden">
                <a href={file.url} target="_blank" rel="noreferrer" className="block aspect-square bg-surface-2">
                  <img src={file.url} alt={file.name} loading="lazy" className="w-full h-full object-cover" />
                </a>
                <figcaption className="p-2.5 space-y-1.5">
                  <p className="text-xs font-medium text-ink truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[11px] text-ink-3">
                    {formatBytes(file.size)}
                    {file.modifiedAt && ` · ${date(file.modifiedAt)}`}
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    {file.usedBy ? <Badge tone="success">{t('media.usedBy', { count: file.usedBy })}</Badge> : <Badge>{t('media.unused')}</Badge>}
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => copy(file.url)}
                        aria-label={t('media.copyLink')}
                        title={t('media.copyLink')}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-ink-3 hover:text-ink hover:bg-surface-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting({ path: file.path, name: file.name, usedBy: file.usedBy })}
                        aria-label={t('common.delete')}
                        title={t('common.delete')}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-ink-3 hover:text-danger hover:bg-danger-soft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </figcaption>
              </figure>
            )
          )}
        </div>
      )}

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={deleting?.folder ? t('media.deleteFolderTitle') : t('media.deleteTitle')}
        closeLabel={t('common.close')}
        size="sm"
      >
        <p className="text-sm text-ink-2 mb-1 font-medium break-all">{deleting?.name}</p>
        <p className="text-sm text-ink-2 mb-6">
          {deleting?.usedBy ? t('media.deleteUsedWarning', { count: deleting.usedBy }) : t('media.deleteConfirm')}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" loading={busy} onClick={confirmDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// หน้าต่างเลือกรูปจากโฟลเดอร์ img/
// ============================================================================
export const MediaLibraryModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
}> = ({ open, onClose, onSelect, multiple }) => {
  const { t } = useI18n();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const toggle = (url: string) =>
    setSelected((prev) => (multiple ? (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]) : [url]));

  return (
    <Modal open={open} onClose={onClose} title={t('media.library')} closeLabel={t('common.close')} size="lg">
      <div className="space-y-4">
        <div className="max-h-[60vh] overflow-y-auto -mx-1 px-1">
          {open && (
            <FolderBrowser
              mode="select"
              selected={selected}
              onToggleSelect={toggle}
              onUploaded={(files) =>
                setSelected((prev) => (multiple ? [...prev, ...files.map((f) => f.url)] : [files[0].url]))
              }
            />
          )}
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-line">
          <p className="text-xs text-ink-3">{t('media.pickHint')}</p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={selected.length === 0}
              onClick={() => {
                onSelect(selected);
                onClose();
              }}
            >
              {t('media.useSelected', { count: selected.length })}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

/** ช่องเลือกรูปหลักของสินค้า */
export const ImagePicker: React.FC<{ value: string; onChange: (url: string) => void; error?: string }> = ({
  value,
  onChange,
  error,
}) => {
  const { t } = useI18n();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useImageUpload();

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div
        className={cx(
          'relative w-full sm:w-40 aspect-square rounded-2xl overflow-hidden bg-surface-2 border-2 border-dashed shrink-0',
          error ? 'border-danger' : 'border-line-strong'
        )}
      >
        {value ? (
          <ProductImage src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-3">
            <ImagePlus className="w-8 h-8" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-surface/70 flex items-center justify-center">
            <Spinner />
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2.5">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setLibraryOpen(true)}>
            <Images className="w-4 h-4" />
            {t('media.chooseFromFolder')}
          </Button>
          <Button size="sm" onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload className="w-4 h-4" />
            {t('media.uploadFromDevice')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowUrl((s) => !s)}>
            <Link2 className="w-4 h-4" />
            URL
          </Button>
        </div>
        {showUrl && <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." aria-label="Image URL" />}
        <p className="text-xs text-ink-3">{t('media.hint')}</p>
        {value && <p className="text-[11px] text-ink-3 break-all">{decodeURIComponent(value)}</p>}
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT_ATTR}
          hidden
          onChange={async (e) => {
            const files = e.target.files;
            e.target.value = '';
            if (!files?.length) return;
            const [img] = await upload(files, '');
            if (img) onChange(img.url);
          }}
        />
      </div>
      <MediaLibraryModal open={libraryOpen} onClose={() => setLibraryOpen(false)} onSelect={([url]) => url && onChange(url)} />
    </div>
  );
};

/** แกลเลอรีรูปเพิ่มเติมของสินค้า */
export const GalleryPicker: React.FC<{ value: string[]; onChange: (urls: string[]) => void }> = ({ value, onChange }) => {
  const { t } = useI18n();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useImageUpload();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        {value.map((url) => (
          <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface-2">
            <ProductImage src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              aria-label={t('common.remove')}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-line-strong text-ink-3 hover:text-ink hover:border-gold flex flex-col items-center justify-center gap-1 text-[10px]"
        >
          <Images className="w-5 h-5" />
          {t('media.folderShort')}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-line-strong text-ink-3 hover:text-ink hover:border-gold flex flex-col items-center justify-center gap-1 text-[10px]"
        >
          {uploading ? <Spinner className="w-5 h-5" /> : <ImagePlus className="w-5 h-5" />}
          {t('media.deviceShort')}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        hidden
        onChange={async (e) => {
          const files = e.target.files;
          e.target.value = '';
          if (!files?.length) return;
          const added = await upload(files, '');
          onChange([...value, ...added.map((a) => a.url)]);
        }}
      />
      <MediaLibraryModal
        open={libraryOpen}
        multiple
        onClose={() => setLibraryOpen(false)}
        onSelect={(urls) => onChange(Array.from(new Set([...value, ...urls])))}
      />
    </div>
  );
};
