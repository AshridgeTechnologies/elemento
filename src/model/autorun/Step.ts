export default class Step {
    constructor(
        public title: string,
        public description: string,
        public elementSelector?: string,
    ) {}
}

export type Script = Step[]
