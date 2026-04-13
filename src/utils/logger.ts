import kleur from "kleur";

export const logger = {
  info: (msg: string) => console.log(kleur.cyan("  info"), msg),
  success: (msg: string) => console.log(kleur.green("  ✓"), msg),
  warn: (msg: string) => console.log(kleur.yellow("  warn"), msg),
  error: (msg: string) => console.error(kleur.red("  error"), msg),
};
