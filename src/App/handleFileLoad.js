// @ts-nocheck
export function handleFileLoad(
  inputElement,
  readType = "readAsDataURL",
  onLoad
) {
  inputElement.onchange = () => {
    const file = inputElement.files[0];
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        return onLoad(reader.result);
      },
      false
    );
    if (file) {
      reader[readType](file);
    }
  };
}
