//  キー入力処理
class Keyboard {
  static init = () => {
    window.addEventListener("keydown", (e)=>{
      const keycode = e.keyCode
      const code  = e.code
      const onShift = e.shiftKey
      const onCtrl  = e.ctrlKey
      const onAlt   = e.altKey
      const onMeta  = e.metaKey

      switch(code) {
        case "Escape":
          if(_data.state.fullscreen) {
            _data.state.fullscreen = false
            _data.react.app.forceUpdate()
          }
          break
      }
    })
  }
}

export {Keyboard}
