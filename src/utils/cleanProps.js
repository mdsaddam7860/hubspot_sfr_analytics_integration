function cleanProps(obj) {
  const cleaned = {};
  for (const key in obj) {
    if (
      obj[key] !== undefined &&
      obj[key] !== null &&
      obj[key] !== "" &&
      obj[key] !== "null"
    ) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export { cleanProps, isValidEmail };
