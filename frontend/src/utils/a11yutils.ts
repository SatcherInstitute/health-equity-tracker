/* srSpeak(text)
  text: the ALERT message to be read aloud by screen reader
  */

export function srSpeak(text: string) {
  const tempElement = document.createElement("div");
  const id = "speak-" + Date.now();
  tempElement.setAttribute("id", id);
  tempElement.setAttribute("role", "alert");
  tempElement.classList.add("srOnly");
  document.body.appendChild(tempElement);

  window.setTimeout(function () {
    tempElement.innerHTML = text;
  }, 100);

  window.setTimeout(function () {
    document.body.removeChild(tempElement);
  }, 1000);
}
