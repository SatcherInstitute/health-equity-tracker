/*
Temporarily creates a hidden HTML element with role="alert"
causing screen readers to announce message as an important update
*/
export function srSpeak(message: string) {
  const temp = document.createElement('div')

  // unique ID
  const id = `speak-${Date.now()}`
  temp.setAttribute('id', id)
  temp.setAttribute('role', 'alert')

  // hide from browsers
  temp.classList.add('sr-only')
  document.body.appendChild(temp)

  // render
  window.setTimeout(() => {
    temp.innerHTML = message
  }, 100)

  // remove
  window.setTimeout(() => {
    document.body.removeChild(temp)
  }, 1000)
}
