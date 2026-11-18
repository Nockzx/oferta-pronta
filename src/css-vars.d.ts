import 'react'

declare module 'react' {
  // Permite variáveis CSS (--p, --ps...) em style={{}} com tipagem.
  interface CSSProperties {
    [variavel: `--${string}`]: string | number | undefined
  }
}
