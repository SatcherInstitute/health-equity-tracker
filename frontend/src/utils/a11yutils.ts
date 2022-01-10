/* srSpeak(text, priority)
  text: the message to be vocalised
  priority (non mandatory): "polite" (by default) or "assertive" */

export function srSpeak(text: string) {
  const el = document.createElement("div");
  const id = "speak-" + Date.now();
  el.setAttribute("id", id);
  el.setAttribute("role", "alert");
  el.classList.add("srOnly");
  document.body.appendChild(el);

  window.setTimeout(function () {
    el.innerHTML = text;
  }, 100);

  window.setTimeout(function () {
    document.body.removeChild(el);
  }, 1000);
}
