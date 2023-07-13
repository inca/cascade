import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';
import { dep } from 'mesh-ioc';

import { Analyzer } from '../dep-analyzer.js';

export class UpdateTask {

    @dep({ key: 'rootDir' }) rootDir!: string;

    async run(deps: string[], versionBump: string) {
        const analyzer = new Analyzer();
        const dirnames = await fs.readdir(this.rootDir);
        for (const dirname of dirnames) {
            const dir = path.join(this.rootDir, dirname);
            await analyzer.addDir(dir);
        }
        const steps = analyzer.buildUpdatePlan(deps);
        for (const step of steps) {
            console.info(chalk.gray(`# ${step.pkg.name} ${step.pkg.version}`));
            console.info(`cd ${step.pkg.dir}`);
            const installArgs = step.deps.map(_ => _ + '@latest').join(' ');
            console.info(`npm i --save ${installArgs}`);
            console.info(`git commit -a -m 'update: ${step.deps.join(' ')}'`);
            console.info(`git push`);
            console.info(`npm version ${versionBump}`);
        }
        // TODO
    }

    async show(deps: string[]) {
        const analyzer = new Analyzer();
        const dirnames = await fs.readdir(this.rootDir);
        for (const dirname of dirnames) {
            const dir = path.join(this.rootDir, dirname);
            await analyzer.addDir(dir);
        }
        const steps = analyzer.buildUpdatePlan(deps);
        for (const step of steps) {
            console.info(chalk.bold(step.pkg.name));
            for (const dep of step.deps) {
                console.info(chalk.yellow(`  - ${dep}`));
            }
        }
    }

}
