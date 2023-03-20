class ToolLogic {
  static viewLarge = (e) => {
    _data.state.viewMode = "large"
    _data.react.map.forceUpdate()
  }
  static viewMiddle = (e) => {
    _data.state.viewMode = "middle"
    _data.react.map.forceUpdate()
  }
  static viewSmall = (e) => {
    _data.state.viewMode = "small"
    _data.react.map.forceUpdate()
  }
  static toggleTag = (e) => {
    _data.state.showTag = !_data.state.showTag
    _data.react.map.forceUpdate()
  }
  static toggleFullscreen = (e) => {
    _data.state.fullscreen = !_data.state.fullscreen
    _data.react.app.forceUpdate()
  }
  static toggleSticker = (e) => {
    _data.state.showSticker = !_data.state.showSticker
    _data.react.map.forceUpdate()
  }
}

export {ToolLogic}
