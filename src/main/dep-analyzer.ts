import fs from 'node:fs/promises';
import path from 'node:path';

export class Analyzer {

    packages: Package[] = [];
    packageMap = new Map<string, Package>();

    buildUpdatePlan(deps: string[]) {
        const plan = new Map<string, string[]>();
        this.buildPlanRecursive(deps, plan);
        return plan;
    }

    private buildPlanRecursive(deps: string[], plan: Map<string, string[]>) {
        for (const pkg of this.packages) {
            const pkgPlan = plan.get(pkg.name) || [];
            for (const dep of deps) {
                if (pkg.dependencies[dep] && !pkgPlan.includes(dep)) {
                    pkgPlan.push(dep);
                    plan.set(pkg.name, pkgPlan);
                    this.buildPlanRecursive([pkg.name], plan);
                }
            }
        }
    }

    *getDependencies(pkgName: string, visited = new Set<string>): Iterable<Package> {
        for (const pkg of this.packages) {
            if (pkg.dependencies[pkgName]) {
                if (visited.has(pkg.name)) {
                    return;
                }
                visited.add(pkg.name);
                yield pkg;
                yield* this.getDependencies(pkg.name, visited);
            }
        }
    }

    async addDir(dir: string) {
        const pkgPath = path.join(dir, 'package.json');
        try {
            const pkgJson = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
            const pkg: Package = {
                path: pkgPath,
                name: pkgJson.name,
                version: pkgJson.version,
                dependencies: pkgJson.dependencies || {},
            };
            this.packages.push(pkg);
            this.packageMap.set(pkg.name, pkg);
        } catch (err: any) {
            if (!['ENOENT', 'ENOTDIR'].includes(err.code)) {
                throw err;
            }
        }
    }

}

export interface Package {
    path: string;
    name: string;
    version: string;
    dependencies: Record<string, string>;
}
