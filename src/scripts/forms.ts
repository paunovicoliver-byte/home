import { track } from './analytics';

type Kind = 'quote' | 'consultation' | 'contact';
type Messages = Record<string, string>;

const EVENTS: Record<Kind, { start: string; submit: string; error: string }> = {
  quote: { start: 'quote_form_start', submit: 'quote_form_submit', error: 'quote_form_error' },
  consultation: { start: 'consultation_start', submit: 'consultation_submit', error: 'consultation_error' },
  contact: { start: 'contact_form_start', submit: 'contact_form_submit', error: 'contact_form_error' },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().\/-]{6,24}$/;

const fileKind = (f: File) => {
  const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['dwg', 'dxf'].includes(ext)) return 'cad';
  return 'other';
};
const sizeBucket = (bytes: number) => (bytes < 1e6 ? '<1MB' : bytes < 3e6 ? '1-3MB' : bytes < 8e6 ? '3-8MB' : '>8MB');

export function initForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-enquiry]').forEach(setup);
}

function setup(form: HTMLFormElement) {
  const kind = form.dataset.enquiry as Kind;
  const ev = EVENTS[kind];
  const msgs: Messages = JSON.parse(form.querySelector('[data-messages]')!.textContent || '{}');
  const wrap = form.closest('[data-enquiry-wrap]')!;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const submitLabel = submit.querySelector<HTMLElement>('[data-submit-label]')!;
  const success = wrap.querySelector<HTMLElement>('[data-form-success]')!;
  const errorTpl = wrap.querySelector<HTMLTemplateElement>('[data-error-template]')!;
  const maxFiles = Number(form.dataset.maxFiles || 5);
  const maxBytes = Number(form.dataset.maxBytes || 8 * 1024 * 1024);
  const acceptExt = (form.dataset.accept || '').split(',').map((s) => s.trim().replace('.', '').toLowerCase());
  let attempted = false;
  let started = false;
  let sending = false;

  const src = form.querySelector<HTMLInputElement>('[data-source-page]');
  if (src) src.value = location.pathname;

  // Prefill from ?type=…&piece=… (e.g. "Customize this piece").
  const qs = new URLSearchParams(location.search);
  const type = qs.get('type');
  if (type) {
    const radio = form.querySelector<HTMLInputElement>(`input[name="project_type"][value="${CSS.escape(type)}"]`);
    if (radio) radio.checked = true;
    const sel = form.querySelector<HTMLSelectElement>('select[name="project_type"]');
    if (sel && [...sel.options].some((o) => o.value === type)) sel.value = type;
  }
  const piece = qs.get('piece');
  const piecesEl = form.querySelector('[data-pieces]');
  if (piece && piecesEl) {
    const names = JSON.parse(piecesEl.textContent || '{}') as Record<string, string>;
    if (names[piece]) {
      form.querySelector<HTMLInputElement>('[data-reference]')!.value = piece;
      const note = form.querySelector<HTMLElement>('[data-reference-note]')!;
      note.querySelector('[data-reference-name]')!.textContent = names[piece];
      note.hidden = false;
    }
  }

  const markStart = () => {
    if (started) return;
    started = true;
    track(ev.start, { form_id: kind });
  };
  form.addEventListener('focusin', markStart, { once: true });
  form.addEventListener('input', markStart, { once: true });

  // ---------- Validation ----------
  const fieldError = (el: HTMLElement): string => {
    if (el instanceof HTMLFieldSetElement) {
      const checked = el.querySelector('input:checked');
      return el.dataset.required === 'choice' && !checked ? msgs.requiredChoice : '';
    }
    const input = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (input instanceof HTMLInputElement && input.type === 'checkbox') {
      return input.dataset.required === 'consent' && !input.checked ? msgs.consent : '';
    }
    if (input instanceof HTMLInputElement && input.type === 'file') return filesError(input);
    const value = input.value.trim();
    if (!value) {
      if (!input.dataset.required) return '';
      return input instanceof HTMLSelectElement ? msgs.requiredSelect : msgs.required;
    }
    if (input.dataset.type === 'email' && !EMAIL_RE.test(value)) return msgs.email;
    if (input.dataset.type === 'phone' && (!PHONE_RE.test(value) || value.replace(/\D/g, '').length < 6)) return msgs.phone;
    const min = Number(input.dataset.minlength || 0);
    if (min && value.length < min) return msgs.tooShort.replace('{min}', String(min));
    const max = (input as HTMLInputElement).maxLength;
    if (max > 0 && value.length > max) return msgs.tooLong.replace('{max}', String(max));
    return '';
  };

  const filesError = (input: HTMLInputElement): string => {
    const files = [...(input.files ?? [])];
    if (files.length > maxFiles) return msgs.fileCount;
    if (files.reduce((s, f) => s + f.size, 0) > maxBytes) return msgs.fileSize;
    if (files.some((f) => !acceptExt.includes(f.name.split('.').pop()?.toLowerCase() ?? ''))) return msgs.fileType;
    return '';
  };

  const errorEl = (el: HTMLElement) => {
    const ids = (el.getAttribute('aria-describedby') || '').split(/\s+/);
    const id = ids.find((i) => i.endsWith('-error'));
    return id ? (document.getElementById(id) as HTMLElement | null) : null;
  };

  const show = (el: HTMLElement, message: string) => {
    const err = errorEl(el);
    if (message) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    if (err) {
      err.textContent = message;
      err.hidden = !message;
    }
  };

  const validatable = () =>
    [...form.querySelectorAll<HTMLElement>('[data-required], [data-type], input[type="file"]')].filter(
      (el) => !(el instanceof HTMLFieldSetElement) || el.dataset.required,
    );

  const nameOf = (el: HTMLElement) => (el instanceof HTMLFieldSetElement ? el.dataset.group! : (el as HTMLInputElement).name);

  const validateAll = () => {
    const invalid: { el: HTMLElement; type: string }[] = [];
    for (const el of validatable()) {
      const m = fieldError(el);
      show(el, m);
      if (m) invalid.push({ el, type: Object.keys(msgs).find((k) => msgs[k] === m) ?? 'invalid' });
    }
    return invalid;
  };

  form.addEventListener('focusout', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-required], [data-type]');
    if (!el || el instanceof HTMLFieldSetElement) return;
    // Validate on leave only once the user has typed something or tried to submit.
    if (attempted || (el as HTMLInputElement).value?.trim()) show(el, fieldError(el));
  });
  form.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    const group = target.closest<HTMLFieldSetElement>('fieldset[data-required]');
    if (group && attempted) show(group, fieldError(group));
    if (target instanceof HTMLInputElement && target.type === 'checkbox' && target.dataset.required && attempted) show(target, fieldError(target));
    if (target instanceof HTMLSelectElement && target.dataset.required && attempted) show(target, fieldError(target));
  });
  form.addEventListener('input', (e) => {
    const el = e.target as HTMLElement;
    if (el.getAttribute('aria-invalid') === 'true' && !(el instanceof HTMLFieldSetElement)) show(el, fieldError(el));
  });

  // ---------- Files ----------
  const fileInput = form.querySelector<HTMLInputElement>('[data-files]');
  if (fileInput) {
    const statusEl = form.querySelector<HTMLElement>('[data-files-status]')!;
    const list = form.querySelector<HTMLElement>('[data-files-list]')!;
    fileInput.addEventListener('change', () => {
      const files = [...(fileInput.files ?? [])];
      statusEl.textContent = files.length ? msgs.filesSelected.replace('{count}', String(files.length)) : msgs.filesNone;
      list.replaceChildren(...files.map((f) => Object.assign(document.createElement('li'), { textContent: f.name })));
      show(fileInput, filesError(fileInput));
      if (files.length) {
        // Only counts, types and a size bucket — never names or contents.
        track('project_file_added', {
          form_id: kind,
          file_count: files.length,
          file_types: [...new Set(files.map(fileKind))],
          total_size: sizeBucket(files.reduce((s, f) => s + f.size, 0)),
        });
      }
    });
  }

  // ---------- Submit ----------
  const setSending = (on: boolean) => {
    sending = on;
    submit.disabled = on;
    submit.setAttribute('aria-busy', String(on));
    submitLabel.textContent = on ? msgs.sending : submitLabel.dataset.label || submitLabel.textContent || '';
  };
  submitLabel.dataset.label = submitLabel.textContent || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    attempted = true;
    status.hidden = true;

    const invalid = validateAll();
    if (invalid.length) {
      status.textContent = invalid.length === 1 ? msgs.summaryOne : msgs.summaryMany.replace('{count}', String(invalid.length));
      status.hidden = false;
      const first = invalid[0].el;
      const focusTarget = first instanceof HTMLFieldSetElement ? first.querySelector<HTMLElement>('input') : first;
      focusTarget?.focus();
      track(ev.error, {
        form_id: kind,
        error_count: invalid.length,
        error_fields: invalid.map((i) => nameOf(i.el)),
        error_types: [...new Set(invalid.map((i) => i.type))],
      });
      return;
    }

    setSending(true);
    const data = new FormData(form);
    const endpoint = form.dataset.endpoint || '/';
    try {
      const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));

      const files = fileInput?.files ? [...fileInput.files] : [];
      track(ev.submit, {
        form_id: kind,
        project_type: String(data.get('project_type') || '') || undefined,
        consultation_type: String(data.get('consultation_type') || '') || undefined,
        timeline: String(data.get('timeline') || '') || undefined,
        wood_preference: String(data.get('wood') || '') || undefined,
        project_country: String(data.get('country') || '') || undefined,
        reference_piece: String(data.get('reference') || '') || undefined,
        has_files: files.length > 0,
        file_count: files.length,
      });

      form.hidden = true;
      success.hidden = false;
      success.focus();
      success.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } catch {
      status.replaceChildren(errorTpl.content.cloneNode(true));
      status.hidden = false;
      status.focus();
      track(ev.error, { form_id: kind, error_count: 1, error_fields: ['submit'], error_types: ['network'] });
    } finally {
      setSending(false);
    }
  });
}
