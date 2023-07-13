import 'reflect-metadata';

import { dep, Mesh } from 'mesh-ioc';

import { UpdateTask } from './tasks/update.js';

export class App {

    @dep() updateTask!: UpdateTask;

    mesh: Mesh;

    constructor(readonly rootDir: string) {
        this.mesh = new Mesh('App');
        this.mesh.connect(this);
        this.mesh.constant('rootDir', rootDir);
        this.mesh.service(UpdateTask);
    }

    async init() {}

}
