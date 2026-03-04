export const formatPhoneForDisplay = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 1) return digits ? `+7` : "";
  if (digits.length <= 4)
    return `+7 (${digits.slice(1, 4)}`;
  if (digits.length <= 7)
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}`;
  if (digits.length <= 9)
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}`;
  if (digits.length === 10)
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 10)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};

export const parsePhoneInput = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("8") && digits.length === 11) {
    return "7" + digits.slice(1);
  }
  if (digits.startsWith("7") && digits.length === 11) {
    return digits;
  }
  if (digits.length === 10 && !digits.startsWith("7")) {
    return "7" + digits;
  }
  return digits;
};
