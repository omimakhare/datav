// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { has } from "lodash";
import { IntervalValues, TimeRange } from "types/time";



export function calculateInterval(range: TimeRange, resolution: number, lowLimitInterval?: string): IntervalValues {
    let lowLimitMs = 1; // 1 millisecond default low limit
    if (lowLimitInterval) {
        lowLimitMs = intervalToMs(lowLimitInterval);
    }

    let intervalMs = roundInterval((range.end.valueOf() - range.start.valueOf()) / resolution);
    if (lowLimitMs > intervalMs) {
        intervalMs = lowLimitMs;
    }
    return {
        intervalMs: intervalMs,
        interval: secondsToHms(intervalMs / 1000),
    };
}

// convert a interval string to milliseconds
// e.g. 1m -> 60000
export function intervalToMs(str: string): number {
    const info = describeInterval(str);
    return info.sec * 1000 * info.count;
}

// histogram & trends
const intervals_in_seconds = {
    y: 31536000,
    M: 2592000,
    w: 604800,
    d: 86400,
    h: 3600,
    m: 60,
    s: 1,
    ms: 0.001,
};
const interval_regex = /(-?\d+(?:\.\d+)?)(ms|[Mwdhmsy])/;
export function describeInterval(str: string) {
    // Default to seconds if no unit is provided
    if (Number(str)) {
        return {
            sec: intervals_in_seconds.s,
            type: 's',
            count: parseInt(str, 10),
        };
    }

    const matches = str.match(interval_regex);
    if (!matches || !has(intervals_in_seconds, matches[2])) {
        throw new Error(
            `Invalid interval string, has to be either unit-less or end with one of the following units: "${Object.keys(
                intervals_in_seconds
            ).join(', ')}"`
        );
    }
    return {
        sec: (intervals_in_seconds as any)[matches[2]] as number,
        type: matches[2],
        count: parseInt(matches[1], 10),
    };
}


export function roundInterval(interval: number) {
    switch (true) {
        // 0.01s
        case interval < 10:
            return 1; // 0.001s
        // 0.015s
        case interval < 15:
            return 10; // 0.01s
        // 0.035s
        case interval < 35:
            return 20; // 0.02s
        // 0.075s
        case interval < 75:
            return 50; // 0.05s
        // 0.15s
        case interval < 150:
            return 100; // 0.1s
        // 0.35s
        case interval < 350:
            return 200; // 0.2s
        // 0.75s
        case interval < 750:
            return 500; // 0.5s
        // 1.5s
        case interval < 1500:
            return 1000; // 1s
        // 3.5s
        case interval < 3500:
            return 2000; // 2s
        // 7.5s
        case interval < 7500:
            return 5000; // 5s
        // 12.5s
        case interval < 12500:
            return 10000; // 10s
        // 17.5s
        case interval < 17500:
            return 15000; // 15s
        // 25s
        case interval < 25000:
            return 20000; // 20s
        // 45s
        case interval < 45000:
            return 30000; // 30s
        // 1.5m
        case interval < 90000:
            return 60000; // 1m
        // 3.5m
        case interval < 210000:
            return 120000; // 2m
        // 7.5m
        case interval < 450000:
            return 300000; // 5m
        // 12.5m
        case interval < 750000:
            return 600000; // 10m
        // 17.5m
        case interval < 1050000:
            return 900000; // 15m
        // 25m
        case interval < 1500000:
            return 1200000; // 20m
        // 45m
        case interval < 2700000:
            return 1800000; // 30m
        // 1.5h
        case interval < 5400000:
            return 3600000; // 1h
        // 2.5h
        case interval < 9000000:
            return 7200000; // 2h
        // 4.5h
        case interval < 16200000:
            return 10800000; // 3h
        // 9h
        case interval < 32400000:
            return 21600000; // 6h
        // 1d
        case interval < 86400000:
            return 43200000; // 12h
        // 1w
        case interval < 604800000:
            return 86400000; // 1d
        // 3w
        case interval < 1814400000:
            return 604800000; // 1w
        // 6w
        case interval < 3628800000:
            return 2592000000; // 30d
        default:
            return 31536000000; // 1y
    }
}


export function secondsToHms(seconds: number): string {
    const numYears = Math.floor(seconds / 31536000);
    if (numYears) {
        return numYears + 'y';
    }
    const numDays = Math.floor((seconds % 31536000) / 86400);
    if (numDays) {
        return numDays + 'd';
    }
    const numHours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    if (numHours) {
        return numHours + 'h';
    }
    const numMinutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    if (numMinutes) {
        return numMinutes + 'm';
    }
    const numSeconds = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
    if (numSeconds) {
        return numSeconds + 's';
    }
    const numMilliseconds = Math.floor(seconds * 1000.0);
    if (numMilliseconds) {
        return numMilliseconds + 'ms';
    }

    return 'less than a millisecond'; //'just now' //or other string you like;
}