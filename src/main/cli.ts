import chalk from 'chalk';
import { Command } from 'commander';
import { config } from 'dotenv';
import fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { App } from './app.js';

export function main() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8'));

    const program = new Command('nodescript')
        .version(pkg.version);

    program.command('plan')
        .description('Display update plan')
        .argument('<deps>', 'comma-separated list of packages to update')
        .option('-r, --root <root>', 'Root directory', process.cwd())
        .option('-e, --env <env>', 'Env file to use', '.env')
        .action(async (deps, opts) => {
            try {
                config({ path: opts.env });
                const app = new App(opts.root);
                await app.init();
                await app.updateTask.show((deps || '').split(','));
            } catch (err: any) {
                console.error(chalk.red(err.message));
                process.exit(1);
            }
        });

    program.command('update')
        .description('Update specified dependencies to latest version and republish everything')
        .argument('<deps>', 'comma-separated list of packages to update')
        .option('-v, --version <version>', 'version bump (major|minor|patch)', 'minor')
        .option('-r, --root <root>', 'Root directory', process.cwd())
        .option('-e, --env <env>', 'Env file to use', '.env')
        .action(async (deps, opts) => {
            try {
                config({ path: opts.env });
                const app = new App(opts.root);
                await app.init();
                await app.updateTask.run((deps || '').split(','), opts.version);
            } catch (err: any) {
                console.error(chalk.red(err.message));
                process.exit(1);
            }
        });

    program.parse();
}
