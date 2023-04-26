export const mobileGenerator = (mobile: string) => {
    return `+94${mobile.substring(1)}`
}

export const generateNumber = (length) => {
    const digits = '0123456789';
    let NumberText = '';
    for (let i = 0; i < length; i++) {
        NumberText += digits[Math.floor(Math.random() * 10)];
    }
  
    const decryptedOTP = (Number(NumberText) * 120) / 22
    return { otp: NumberText, decryptedOTP };
  };