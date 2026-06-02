import crypto from 'crypto';

export const generateRecoveryCodes = () => {
    return Array.from({length: 10}, () => crypto.randomBytes(4).toString('hex').match(/.{1,4}/g)!.join('-'));
}

export const getFifteenMinutesAgo = () => {
    return new Date(Date.now() -15 * 60 * 1000);
}

export const parseUserAgent = (ua: string) => {
    const osMatch = ua.match(/(Windows|Mac OS|Linux|Android|iPhone|iPad)/);
    const browserMatch = ua.match(/(Chrome|Safari(?!.*Chrome)|Firefox|Edge)/);

    const os = osMatch ? osMatch[0] : "Nieznany system";
    const browser = browserMatch ? browserMatch[0] : "Nieznana przeglądarka";

    return `${os} - ${browser}`;
}