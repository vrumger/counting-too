class Queue {
    constructor() {
        this.queue = new Map();
    }

    async add(key, func) {
        let q = this.queue.get(key);

        if (!q) {
            q = {
                running: false,
                queue: [],
            };
            this.queue.set(key, q);
        }

        q.queue.push(func);
        await this.run(key);
    }

    async run(key) {
        const q = this.queue.get(key);

        if (!q || q.running) {
            return;
        }

        q.running = true;
        while (q.queue.length) {
            const func = q.queue.shift();

            try {
                await func();
            } catch (error) {
                console.error(error);
            }
        }
        q.running = false;
    }
}

module.exports = Queue;
