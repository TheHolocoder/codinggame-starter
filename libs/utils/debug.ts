
class Debug {
    static enabled = true;

    print(data: unknown): void {
        if (Debug.enabled) {
            console.error(data);
        }
    }
}

export const d = new Debug().print;
export function enableDebug(flag: boolean): void {
    Debug.enabled = flag;
}
