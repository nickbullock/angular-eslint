jest.mock('eslint', () => ({
  ESLint: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ESLint } = require('eslint');
(<jest.SpyInstance>ESLint).mockImplementation(() => ({
  lintFiles: (args: string[]) => args,
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { lint } = require('../../src/utils/eslint-utils');

describe('eslint-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create the ESLint instance with the proper parameters', async () => {
    await lint('/root', './.eslintrc.json', <unknown>{
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    }).catch(() => {});

    expect(ESLint).toHaveBeenCalledWith({
      overrideConfigFile: './.eslintrc.json',
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      ignorePath: undefined,
      useEslintrc: true,
      errorOnUnmatchedPattern: false,
    });
  });

  it('should create the ESLint instance with the proper parameters', async () => {
    await lint('/root', undefined, <unknown>{
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    }).catch(() => {});

    expect(ESLint).toHaveBeenCalledWith({
      overrideConfigFile: undefined,
      fix: true,
      cache: true,
      cacheLocation: '/root/cache',
      ignorePath: undefined,
      useEslintrc: true,
      errorOnUnmatchedPattern: false,
    });
  });
});
