import {DateTime} from "luxon";

export const getWarsawNow = (): DateTime => {
    return DateTime.now().setZone("Europe/Warsaw");
};

export const getWarsawStartOfDay = (dateParam?: string | Date): DateTime => {
    let dt = dateParam ? DateTime.fromJSDate(new Date(dateParam)) : DateTime.now();
    return dt.setZone("Europe/Warsaw").startOf("day");
};

export const buildWarsawDateObj = (dateString: string | Date, timeString: string): Date => {
    const [hours, minutes] = timeString.split(":");

    return DateTime.fromJSDate(new Date(dateString))
        .setZone("Europe/Warsaw")
        .set({ hour: parseInt(hours), minute: parseInt(minutes), second: 0, millisecond: 0 })
        .toJSDate();
}
