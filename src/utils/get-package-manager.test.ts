import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { getPackageManager } from './get-package-manager';

// Mock the fs module
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

describe('getPackageManager', () => {
  const mockExistsSync = vi.mocked(existsSync);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('bun detection', () => {
    it('should detect bun when bun.lockb exists', () => {
      mockExistsSync.mockImplementation((path) => {
        return path.toString().endsWith('bun.lockb');
      });

      const result = getPackageManager('/test/project');

      expect(result).toBe('bun');
    });

    it('should detect bun when bun.lock exists', () => {
      mockExistsSync.mockImplementation((path) => {
        return path.toString().endsWith('bun.lock');
      });

      const result = getPackageManager('/test/project');

      expect(result).toBe('bun');
    });

    it('should prioritize bun over other package managers', () => {
      mockExistsSync.mockReturnValue(true);

      const result = getPackageManager('/test/project');

      expect(result).toBe('bun');
    });
  });

  describe('pnpm detection', () => {
    it('should detect pnpm when pnpm-lock.yaml exists', () => {
      mockExistsSync.mockImplementation((path) => {
        if (path.toString().endsWith('bun.lockb')) return false;
        if (path.toString().endsWith('bun.lock')) return false;
        if (path.toString().endsWith('pnpm-lock.yaml')) return true;
        return false;
      });

      const result = getPackageManager('/test/project');

      expect(result).toBe('pnpm');
    });

    it('should prioritize pnpm over yarn and npm', () => {
      mockExistsSync.mockImplementation((path) => {
        if (path.toString().endsWith('bun.lockb')) return false;
        if (path.toString().endsWith('bun.lock')) return false;
        if (path.toString().endsWith('pnpm-lock.yaml')) return true;
        if (path.toString().endsWith('yarn.lock')) return true;
        if (path.toString().endsWith('package-lock.json')) return true;
        return false;
      });

      const result = getPackageManager('/test/project');

      expect(result).toBe('pnpm');
    });
  });

  describe('yarn detection', () => {
    it('should detect yarn when yarn.lock exists', () => {
      mockExistsSync.mockImplementation((path) => {
        if (path.toString().endsWith('bun.lockb')) return false;
        if (path.toString().endsWith('bun.lock')) return false;
        if (path.toString().endsWith('pnpm-lock.yaml')) return false;
        if (path.toString().endsWith('yarn.lock')) return true;
        return false;
      });

      const result = getPackageManager('/test/project');

      expect(result).toBe('yarn');
    });

    it('should prioritize yarn over npm', () => {
      mockExistsSync.mockImplementation((path) => {
        if (path.toString().endsWith('bun.lockb')) return false;
        if (path.toString().endsWith('bun.lock')) return false;
        if (path.toString().endsWith('pnpm-lock.yaml')) return false;
        if (path.toString().endsWith('yarn.lock')) return true;
        if (path.toString().endsWith('package-lock.json')) return true;
        return false;
      });

      const result = getPackageManager('/test/project');

      expect(result).toBe('yarn');
    });
  });

  describe('npm fallback', () => {
    it('should return npm when no lock files exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = getPackageManager('/test/project');

      expect(result).toBe('npm');
    });

    it('should return npm as default fallback', () => {
      mockExistsSync.mockImplementation((path) => {
        if (path.toString().endsWith('bun.lockb')) return false;
        if (path.toString().endsWith('bun.lock')) return false;
        if (path.toString().endsWith('pnpm-lock.yaml')) return false;
        if (path.toString().endsWith('yarn.lock')) return false;
        return false;
      });

      const result = getPackageManager('/test/project');

      expect(result).toBe('npm');
    });
  });

  describe('priority order', () => {
    it('should follow priority order: bun > pnpm > yarn > npm', () => {
      // Test bun priority
      mockExistsSync.mockReturnValue(true);
      expect(getPackageManager('/test/project')).toBe('bun');

      // Test pnpm priority (no bun)
      mockExistsSync.mockImplementation((path) => {
        if (path.toString().includes('bun')) return false;
        return true;
      });
      expect(getPackageManager('/test/project')).toBe('pnpm');

      // Test yarn priority (no bun, no pnpm)
      mockExistsSync.mockImplementation((path) => {
        if (path.toString().includes('bun')) return false;
        if (path.toString().includes('pnpm')) return false;
        return true;
      });
      expect(getPackageManager('/test/project')).toBe('yarn');

      // Test npm fallback (no other lock files)
      mockExistsSync.mockReturnValue(false);
      expect(getPackageManager('/test/project')).toBe('npm');
    });
  });
});
