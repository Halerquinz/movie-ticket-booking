export function getCommaSeparatedIdList(s: string): number[] {
    if (s === "")
        return [];

    return s.split(",").map((substring) => +substring);
}