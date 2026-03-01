export function extractByPath(obj: unknown, path: string): unknown {
  if (path === '' || path === '$' || path === '.') return obj;

  const normalized = path.replace(/^\$\.?/, '').replace(/^\[/, '').replace(/\]$/, '');

  if (normalized === '') return obj;

  const parts = tokenizePath(normalized);

  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;

    if (typeof part === 'number') {
      if (!Array.isArray(current)) return undefined;
      current = current[part];
    } else {
      if (typeof current !== 'object' || Array.isArray(current)) return undefined;
      current = (current as Record<string, unknown>)[part];
    }
  }

  return current;
}

function tokenizePath(path: string): (string | number)[] {
  const parts: (string | number)[] = [];
  const regex = /([^.[\]]+)|\[(\d+)\]/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(path)) !== null) {
    if (match[2] !== undefined) {
      parts.push(parseInt(match[2], 10));
    } else if (match[1] !== undefined) {
      parts.push(match[1]);
    }
  }

  return parts;
}

export function formatExtractedValue(value: unknown): string {
  if (value === undefined) return '';
  if (value === null) return 'null';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
