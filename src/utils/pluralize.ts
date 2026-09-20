export const getPlural = (count: number, forms: [string, string, string]): string => {

    if (count === 1 ) {
        return forms[0];
    }

    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
        return forms[1];
    }

    return forms[2];
};