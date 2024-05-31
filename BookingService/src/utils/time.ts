import { injected, token } from "brandi";

export interface Timer {
    getCurrentTime(): number;
}

export class TimeImpl implements Timer {
    public getCurrentTime(): number {
        return Math.round(Date.now());
    }
}

injected(TimeImpl);

export const TIMER_TOKEN = token<Timer>("Timer");