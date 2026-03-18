'use strict';

class EventBus {
    constructor() {
        this.listeners = {};
    }

    // Subscribe to an event
    on(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    // Unsubscribe from an event
    off(event, listener) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== listener);
    }

    // Emit an event
    emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(listener => listener(data));
    }
}

module.exports = EventBus;