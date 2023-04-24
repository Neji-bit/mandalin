import React from 'react'
import {ToolLogic} from '../logic/tool_logic'

import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

class Sticker extends React.Component {
  constructor(props) {
    super(props)
    this.id = props.id
    this.parent = props.parent
    this.state = {
      current: false,
      drag: false,
      scale: false,
      rotate: false
    }
    this.src = this.props.src
    this.style = this.props.style
    this.ref = React.createRef()
    _data.react[this.id] = this
  }
  static initialStyle = () => {
    let style = {}
    style.position = "absolute"
    style.height = "20%"
    style.top = "0%"
    style.left = "0%"
    style.transform = "rotate(0deg)"
    return style
  }
  //  ある値を、範囲の中に収まるように調整する
  _adjustPoint = (point = 0, min = 0, max = 255) => {
    if(point < min) return min
    if(max < point) return max
    return point
  }
  //  エディタ上でのステッカー移動用。
  //  エディタ範囲内で、ステッカーの中心がカーソル位置に当たるように位置調整する。
  _moveCenterToCursor = (e) => {
    let pr = this.ref.current.parentNode.getBoundingClientRect()
    let r = this.ref.current.getBoundingClientRect()
    let x = e.clientX - pr.left - (r.width / 2)
    let y = e.clientY - pr.top - (r.height / 2)
    x = this._adjustPoint(
          e.clientX,
          pr.left + r.width / 2,
          pr.right - r.width / 2)
    y = this._adjustPoint(
          e.clientY,
          pr.top + r.height / 2,
          pr.bottom - r.height / 2)
    this.style.left = `${Math.floor(((x - pr.left - r.width / 2) * 10000 / pr.width)) / 100}%`
    this.style.top = `${Math.floor(((y - pr.top - r.height / 2) * 10000 / pr.height)) / 100}%`
    this.forceUpdate()
  }
  _scale = (e) => {
    //  ステッカーのサイズ調整
    //  カーソルが、ステッカーの左上から縦に離れるほど大きくなる
    let pr = this.ref.current.parentNode.getBoundingClientRect()
    let r = this.ref.current.getBoundingClientRect()
    this.style.height = `${(Math.floor(Math.abs(r.top - e.clientY) * 10000 / pr.height)) / 100}%`
    this.forceUpdate()
  }
  _rotate = (e) => {
    //  ステッカーの回転
    //  カーソルが、ステッカーの中央から右に離れるほど回転する
    let r = this.ref.current.getBoundingClientRect()
    let c = r.left + r.width / 2
    let d = Math.floor(e.clientX - c)
    if(d < 0) d = 0
    this.style.transform = `rotate(${d % 360}deg)`
    this.forceUpdate()
  }
  clicked = (e) => {
    //  ステッカーパレット
    if("selection--sticker" == _data.state.selectionMode) {
      this.setState({selected: !this.state.selected},
      () => { ToolLogic.paletteStickerMenu(e) })
    }
    e.preventDefault()
    e.stopPropagation()
  }
  mouseDowned = (e) => {
    if(_data.state.stickerMode == "move") {
      this.setState({drag: true})
      this._moveCenterToCursor(e)
    }
    if(_data.state.stickerMode == "scale") {
      this.setState({scale: true})
    }
    if(_data.state.stickerMode == "rotate") {
      this.setState({rotate: true})
    }
  }
  mouseMoved = (e) => {
    if(this.state.drag) this._moveCenterToCursor(e)
    if(this.state.scale) this._scale(e)
    if(this.state.rotate) this._rotate(e)
  }
  mouseOuted = (e) => {
    if(this.state.drag) this.setState({drag: false})
    if(this.state.scale) this.setState({scale: false})
    if(this.state.rotate) this.setState({rotate: false})
  }
  mouseUped = (e) => {
    if(this.state.drag) this.setState({drag: false})
    if(this.state.scale) this.setState({scale: false})
    if(this.state.rotate) this.setState({rotate: false})
  }
  render() {
    let classList = []
    if(this.state.drag) classList.push("sticker--drag")
    if(this.state.current) classList.push("sticker--current")
    return (
      <img
        id={this.id}
        ref={this.ref}
        onMouseDown={this.mouseDowned}
        onMouseMove={this.mouseMoved}
        onMouseOut={this.mouseOuted}
        onMouseUp={this.mouseUped}
        onClick={this.clicked}
        src={this.src}
        className={classList.join(" ")}
        style={Object.assign({}, this.style)}
        draggable="false"
      />
    )
  }
}

export {Sticker}
