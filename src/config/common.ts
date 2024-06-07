import { SERVICE_PROVIDERS } from './const';

export const mobileGenerator = (mobile: string) => {
  return `+94${mobile.substring(1)}`;
};

export const mobileGeneratorWithOutPlus = (mobile: string) => {
  return `94${mobile.substring(1)}`;
};

export const _checkDuplicateNumber = async (csvDataArr) => {
  return [...new Set(csvDataArr)];
};

export const generateNumber = (length) => {
  const digits = '0123456789';
  let NumberText = '';
  for (let i = 0; i < length; i++) {
    NumberText += digits[Math.floor(Math.random() * 10)];
  }

  const decryptedOTP = (Number(NumberText) * 120) / 22;
  return { otp: NumberText, decryptedOTP };
};

export const generateStringHash = (length: number) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return randomString;
};


