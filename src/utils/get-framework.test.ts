import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { getFramework } from './get-framework';

// Mock the fs module
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('getFramework', () => {
  const mockExistsSync = vi.mocked(existsSync);
  const mockReadFileSync = vi.mocked(readFileSync);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Next.js detection', () => {
    it('should detect Next.js when next is in dependencies', () => {
      const mockPackageJson = {
        dependencies: {
          next: '^14.0.0',
          react: '^18.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('next');
    });

    it('should detect Next.js when next is in devDependencies', () => {
      const mockPackageJson = {
        devDependencies: {
          next: '^14.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('next');
    });
  });

  describe('Vite detection', () => {
    it('should detect Vite when vite is in dependencies', () => {
      const mockPackageJson = {
        dependencies: {
          vite: '^5.0.0',
          react: '^18.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('vite');
    });

    it('should detect Vite when vite is in devDependencies', () => {
      const mockPackageJson = {
        devDependencies: {
          vite: '^5.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('vite');
    });
  });

  describe('Remix detection', () => {
    it('should detect Remix when @remix-run/react is in dependencies', () => {
      const mockPackageJson = {
        dependencies: {
          '@remix-run/react': '^2.0.0',
          react: '^18.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('remix');
    });

    it('should detect Remix when @remix-run/node is in dependencies', () => {
      const mockPackageJson = {
        dependencies: {
          '@remix-run/node': '^2.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('remix');
    });

    it('should detect Remix when @remix-run/cloudflare is in dependencies', () => {
      const mockPackageJson = {
        dependencies: {
          '@remix-run/cloudflare': '^2.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('remix');
    });
  });

  describe('Astro detection', () => {
    it('should detect Astro when astro is in dependencies', () => {
      const mockPackageJson = {
        dependencies: {
          astro: '^4.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('astro');
    });

    it('should detect Astro when astro is in devDependencies', () => {
      const mockPackageJson = {
        devDependencies: {
          astro: '^4.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('astro');
    });
  });

  describe('TanStack Start detection', () => {
    it('should detect TanStack Start when @tanstack/start is in dependencies', () => {
      const mockPackageJson = {
        dependencies: {
          '@tanstack/start': '^1.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('tanstack-start');
    });

    it('should detect TanStack Start when @tanstack/react-start is in dependencies', () => {
      const mockPackageJson = {
        dependencies: {
          '@tanstack/react-start': '^1.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('tanstack-start');
    });
  });

  describe('React Router v7 detection', () => {
    it('should detect React Router v7 when react-router and @react-router/dev are in dependencies', () => {
      const mockPackageJson = {
        dependencies: {
          'react-router': '^7.0.0',
          '@react-router/dev': '^7.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('react-router');
    });

    it('should not detect React Router v7 when only react-router is present', () => {
      const mockPackageJson = {
        dependencies: {
          'react-router': '^6.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('manual');
    });

    it('should not detect React Router v7 when only @react-router/dev is present', () => {
      const mockPackageJson = {
        dependencies: {
          '@react-router/dev': '^7.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('manual');
    });
  });

  describe('Laravel detection', () => {
    it('should detect Laravel when laravel/framework is in composer.json', () => {
      mockExistsSync.mockImplementation((path) => {
        if (path.toString().endsWith('package.json')) return true;
        if (path.toString().endsWith('composer.json')) return true;
        return false;
      });

      mockReadFileSync.mockImplementation((path) => {
        if (path.toString().endsWith('package.json')) {
          return JSON.stringify({ dependencies: {} });
        }
        if (path.toString().endsWith('composer.json')) {
          return JSON.stringify({
            require: {
              'laravel/framework': '^10.0',
            },
          });
        }
        return '{}';
      });

      const result = getFramework('/test/project');

      expect(result).toBe('laravel');
    });

    it('should not detect Laravel when composer.json does not exist', () => {
      mockExistsSync.mockImplementation((path) => {
        if (path.toString().endsWith('package.json')) return true;
        if (path.toString().endsWith('composer.json')) return false;
        return false;
      });

      mockReadFileSync.mockReturnValue(JSON.stringify({ dependencies: {} }));

      const result = getFramework('/test/project');

      expect(result).toBe('manual');
    });
  });

  describe('manual fallback', () => {
    it('should return "manual" when no framework is detected', () => {
      const mockPackageJson = {
        dependencies: {
          react: '^18.0.0',
        },
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('manual');
    });

    it('should return "manual" when package.json does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = getFramework('/test/project');

      expect(result).toBe('manual');
    });

    it('should return "manual" when package.json is invalid JSON', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('invalid json{');

      const result = getFramework('/test/project');

      expect(result).toBe('manual');
    });

    it('should return "manual" when package.json has no dependencies', () => {
      const mockPackageJson = {
        name: 'test-project',
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = getFramework('/test/project');

      expect(result).toBe('manual');
    });
  });
});
