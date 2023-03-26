import React from 'react'
import {Map, LargeMap, MiddleMap, SmallMap, Area} from './map'
import {Page} from './page'
import {ToolBox} from './tool'
import {IconLogo} from './common'
import {Editor} from './cell'
import {Util} from '../logic/util'

class Backboard extends React.Component {
  render() {
    let cls = ""
    if(_data.state.fullscreen) cls="fullscreen"
    return(
      <div>
        <div
          id="layout_backboard"
          className={`panel ${cls}`}
        >
          <TopPanel parent={this}/>
          <LeftPanel parent={this}/>
          <CenterPanel parent={this}/>
          <RightPanel parent={this}/>
          <BottomPanel parent={this}/>
        </div>
        <PaletteSheet/>
      </div>
    )
  }
}

class TopPanel extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "layout_top"
    _data.react[this.id] = this
  }
  render() {
    return(
      <div id={this.id} className="panel">
        <div
          key="1"
        >
        </div>
        <Editor
          parent={this}
          role="book--title"
          source={_data.book.title}
          key="2"
        />
        <div
          className="accounts"
          key="3"
        >
          <div
            className="status"
          >
            ReadOnly
          </div>
          <div
            className="email"
          >
            me@example.com
          </div>
          <div
            className="switch"
          >
            <button>
              LogOut
            </button>
          </div>
        </div>
      </div>
    )
  }
}

class LeftPanel extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "layout_left"
    _data.react[this.id] = this
  }
  render() {
    return(
      <div id={this.id} className="panel">
        <ToolBox/>
      </div>
    )
  }
}

class CenterPanel extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "layout_center"
    _data.react[this.id] = this
  }
  render() {
    return(
      <div id={this.id} className="panel">
        <Map />
      </div>
    )
  }
}

class RightPanel extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "layout_right"
    _data.react[this.id] = this
  }
  render() {
    let contents = []
    Page.page_ids.split("").forEach((i, n) => {
      contents.push(
        <Page
          page_id={`page_${i}`}
          parent={this}
          className="page"
          key={n}
        />)
    })
    return(
      <div id={this.id} className="panel">
        <div
          className="page--list"
        >
          <div
            className="label"
          >
            PageList
          </div>
          {contents}
        </div>
      </div>
    )
  }
}

class BottomPanel extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "layout_bottom"
    _data.react[this.id] = this
  }
  render() {
    return(
      <div id={this.id} className="panel">
        <IconLogo parent={this}/>
      </div>
    )
  }
}

class PaletteSheet extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "palette_sheet"
    _data.react[this.id] = this
    this.state={enable: null}
  }
  clicked = (e) => {
    //  パレットシートをダブルクリックすると、ダブルクリックが下のセルに通ってしまうのがちょっと気持ち悪い。
    //  stopPropagation, preventDefault では防げない模様。
    this.setState({enable: false},
      () => {
        _data.state.paletteStickerUrl = false
        _data.state.paletteStickerMenu = false
        _data.state.paletteDesignMenu = false
        _data.state.stickerMode = "none"
        Util.releaseSelected("cell")
        let stickers = [...document.getElementsByClassName("sticker--current")]
        stickers.forEach((s) => { _data.react[s.id].setState({current: false}) })
      }
    )
  }
  render() {
    let classList = []
    if(this.state.enable != null) {
      classList.push(this.state.enable ? "fadeIn" : "fadeOut")
    }
    return(
      <div
        id={this.id}
        className={classList.join(" ")}
        onClick={this.clicked}
      >
        <Palette parent={this}/>
      </div>
    )
  }
}

class Palette extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "palette"
    _data.react[this.id] = this
  }
  componentWillUnmount() {
    Util.releaseSelected("cell")
  }
  clicked = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }
  render() {
    let classList = ["palette"]
    let type = "_hidden"
    let palette = null
    if(_data.state.paletteStickerUrl) {
      type = "palette--sticker--url"
      palette = (<PaletteStickerUrl/>)
    }
    if(_data.state.paletteStickerMenu) {
      type = "palette--sticker--menu"
      palette = (<PaletteStickerMenu/>)
    }
    if(_data.state.paletteDesignMenu) {
      type = "palette--design--menu"
    }
    classList.push(type)
    let style = Object.assign({}, _data.state.palettePoint)
    return(
      <div
        id={this.id}
        className={classList.join(" ")}
        style={style}
        onClick={this.clicked}
      >
        {palette}
      </div>
    )
  }
}

class PaletteStickerUrl extends React.Component {
  inputed = (e) => {
    let i = e.currentTarget
    let width = i.getBoundingClientRect().width
    let _width = Util.remToPx((i.value.length + 4) / 2)
    i.style.width = `${Math.max(width, _width)}px`

    let target = _data.state.paletteTarget
    let cell_id = target.match("^.{7}")
    let type = target.match("[^_]*$")
    _data[cell_id][type].effect = i.value
    _data.react[cell_id].forceUpdate()
  }
  render() {
    return (
      <div
        id="palette_sticker_url"
      >
        <div>URL:</div>
        <input
          id="palette_sticker_url_input"
          onInput={this.inputed}
        />
      </div>
    )
  }
}

class PaletteStickerMenu extends React.Component {
  _stickerActive = (e) => {
    let sticker = _data.react[_data.state.paletteTarget]
    sticker.setState({current: true})
    _data.state.paletteStickerMenu = false
    _data.react.palette_sheet.forceUpdate()
  }
  move = (e) => {
    //  移動。
    //  クリックしたら画像の見た目が変わる。
    //  ドラッグしたら動く。
    //  外野をクリックしたら解除。
    _data.state.stickerMode = "move"
    this._stickerActive()
    console.log("Move")
  }
  scale = (e) => {
    _data.state.stickerMode = "scale"
    this._stickerActive()
    console.log("Scale")
  }
  rotate = (e) => {
    _data.state.stickerMode = "rotate"
    this._stickerActive()
    console.log("Rotate")
  }
  remove = (e) => {
    _data.state.stickerMode = "remove"
    this._stickerActive()
    console.log("Remove")
  }
  detail = (e) => {
    _data.state.stickerMode = "detail"
    this._stickerActive()
    console.log("Detail")
  }
  render() {
    return (
      <div
        id="palette_sticker_menu"
      >
        <button
          onClick={this.move}
        > 移動 </button>
        <button
          onClick={this.scale}
        > 拡大 </button>
        <button
          onClick={this.rotate}
        > 回転 </button>
        <button
          onClick={this.remove}
        > 削除 </button>
        <button
          onClick={this.detail}
        > 詳細 </button>
      </div>
    )
  }
}

class PaletteDesignMenu extends React.Component {
}

export default Backboard
