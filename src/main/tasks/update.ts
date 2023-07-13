import fs from 'node:fs/promises';
import path from 'node:path';

import { dep } from 'mesh-ioc';

import { Analyzer } from '../dep-analyzer.js';

export class UpdateTask {

    @dep({ key: 'rootDir' }) rootDir!: string;

    async run(deps: string[]) {
        if (!deps.length) {
            throw new Error('Must specify at least one dependency to update');
        }
        const analyzer = new Analyzer();
        const dirnames = await fs.readdir(this.rootDir);
        for (const dirname of dirnames) {
            const dir = path.join(this.rootDir, dirname);
            await analyzer.addDir(dir);
        }
        console.log(analyzer.buildUpdatePlan(deps));
        // TODO
    }

}
