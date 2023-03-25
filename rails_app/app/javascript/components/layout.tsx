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
        Util.releaseSelected("cell")
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
    if(_data.react.palette_sheet.state.enable) {
    }
    type = ""
    if(_data.state.paletteStickerUrl) type = "palette--sticker--url"
    if(_data.state.paletteStickerMenu) type = "palette--sticker--menu"
    if(_data.state.paletteDesignMenu) type = "palette--design--menu"
    classList.push(type)
    let style = Object.assign({}, _data.state.palettePoint)
    return(
      <div
        id={this.id}
        className={classList.join(" ")}
        style={style}
        onClick={this.clicked}
      >
        <PaletteStickerUrl/>
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

class PaletteStickerMenu {
}

class PaletteDesignMenu {
}

export default Backboard
