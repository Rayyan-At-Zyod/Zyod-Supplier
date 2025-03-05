export const validateAddRMForm = ({
  name,
  mainImage,
  price,
  gsm,
  width,
  quantity,
}) => {
  console.log("item:", name, mainImage, price, gsm, width, quantity);
  if (!name || name.trim() === "") {
    return "Name is required";
  }
  if (!mainImage) {
    return "Product image is required";
  }
  if (!price) {
    return "Price is required";
  }
  if (!gsm) {
    return "GSM is required";
  }
  if (!width) {
    return "Width is required";
  }
  if (!quantity) {
    return "Quantity is required";
  }
  return null; // No errors
};
