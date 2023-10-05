
export type Options = Partial<{
  removeSelf: boolean
}>
export type SupportedAttrs = Partial<Pick<HTMLScriptElement,
  'async' | 'crossOrigin' | 'defer' | 'integrity' |
  'noModule' | 'referrerPolicy' | 'src' | 'text' | 'type'
>>
export type Where = 'head' | 'body' | HTMLElement

export const loadScript = (where: Where, attrs: SupportedAttrs, opts?: Options) => {
  const script = document.createElement("script")
  script.type = "text/javascript"
  for (const key in attrs)
    (script as any)[key] = (attrs as any)[key]

  const parent = typeof where === 'string' ? document[where] : where
  parent.appendChild(script)

  if (opts?.removeSelf !== false) {
    script.addEventListener('error', () => parent.removeChild(script))
    script.addEventListener('load', () => parent.removeChild(script))
  }
  return script
}

export const asyncLoadScript = async (where: Where, attrs: SupportedAttrs, opts?: Options) => new Promise((resolve, reject) => {
  const script = loadScript(where, attrs)
  script.addEventListener('error', e => reject(e))
  script.addEventListener('load', e => resolve(e))
});