import React from 'react'
import {Map, LargeMap, MiddleMap, SmallMap, Area} from './map'
import {Page} from './page'
import {ToolBox, ToolButton, ToolToggle} from './tool'
import {IconLogo} from './common'
import {Editor, Sticker} from './cell'
import {Util} from '../logic/util'
import {ToolLogic} from '../logic/tool_logic'

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
    let readonly = _readonly ? "editable--only" : ""
    let accountButton = null
    if(_readonly) {
      accountButton = (
        <div
          className={`logout--button`}
        >
          <ToolButton
            parent={this}
            label="Login"
            logic={ToolLogic.login}
            tool_id="tool_toggle_publish"
            checked={_data.authorization.is_public}
            key="17"
          />
        </div>
      )
    } else {
      accountButton = (
        <div
          className={`logout--button`}
        >
          <ToolButton
            parent={this}
            label="Logout"
            logic={ToolLogic.logout}
            tool_id="tool_toggle_publish"
            checked={_data.authorization.is_public}
            key="18"
          />
        </div>
      )
    }
    return(
      <div id={this.id} className="panel">
        <div
          key="1"
        >
          <div
            className={`public--switch ${readonly}`}
          >
            <ToolToggle
              parent={this}
              label="公開"
              logic={ToolLogic.publish}
              tool_id="tool_toggle_publish"
              checked={_data.authorization.is_public}
              key="17"
            />
          </div>
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
            {_data.app_info.is_owner ? "編集モード" : "読取専用"}
          </div>
          <div
            className="email"
          >
            {_data.app_info.visitor_email || "Guest"}
          </div>
          <div
            className="switch"
          >
          {accountButton}
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
            ページリスト
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
        _data.state.paletteTarget = null
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
  mouseDowned = (e) => {
    if(_data.state.paletteTarget)
      if(_data.state.stickerMode != "none")
        _data.react[_data.state.paletteTarget].mouseDowned(e)
  }
  mouseMoved = (e) => {
    if(_data.state.paletteTarget)
      if(_data.state.stickerMode != "none")
        _data.react[_data.state.paletteTarget].mouseMoved(e)
  }
  mouseUped = (e) => {
    if(_data.state.paletteTarget)
      if(_data.state.stickerMode != "none")
        _data.react[_data.state.paletteTarget].mouseUped(e)
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
        onMouseDown={this.mouseDowned}
        onMouseMove={this.mouseMoved}
        onMouseUp={this.mouseUped}
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
      palette = (<PaletteDesignMenu/>)
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
    //  インプット幅の自動調整
    let i = e.currentTarget
    let width = i.getBoundingClientRect().width
    let _width = Util.remToPx((i.value.length + 4) / 2)
    i.style.width = `${Math.max(width, _width)}px`

    //  ステッカー作成処理
    //  「作成タイミングの判定」は、仮で「画像URLが入力されたら」とする（よりよい案に直したい）。
    if(i.value.match(/\.(png|jpg|svg|bmp)$/i)) {
      let target = _data.state.paletteTarget
      let cell_id = target.match("^cell_..")
      let type = target.match("[^_]*$")
      let style = Sticker.initialStyle()
      let pr = document.getElementById(_data.state.paletteTarget).getBoundingClientRect()
      let cr = e.currentTarget.closest(".palette").getBoundingClientRect()
      style.left = cr.left - pr.left
      style.top = cr.top - pr.top
      _data[cell_id][type].effect.push({src: i.value, style: style})
      _data.react[cell_id].forceUpdate()
    }
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
    //  ステッカーの削除
    let sticker_id = _data.state.paletteTarget
    let cell_id = sticker_id.match(/^cell_../)[0]
    let type = sticker_id.split("_")[3]
    let index = parseInt(sticker_id.split("_")[5])
    //  要素の削除は「データの殻は残し中身を空にする」形をとる。
    //  spliceで要素を除去してみたが、おそらくreactのkey管理の影響で「登録順の最後のステッカーから消えていく」変な挙動になったので、この形で回避した。
    _data[cell_id][type].effect[index].src = ""
    _data[cell_id][type].effect[index].style = ""

    //  パレットを閉じる
    _data.state.paletteTarget = null
    _data.state.stickerMode = "none"
    _data.state.paletteStickerMenu = false
    _data.react.palette_sheet.setState({enable: false})
    _data.react[cell_id].forceUpdate()
    console.log("Remove")
  }
  detail = (e) => {
    //  ステッカーのURLをクリップボードにコピーする。
    //  「URL再設定」のUIを作るのが大変なので簡易版で逃げた。
    let sticker_id = _data.state.paletteTarget
    navigator.clipboard.writeText(document.getElementById(sticker_id).src)

    //  パレットを閉じる
    let cell_id = sticker_id.match(/^cell_../)[0]
    _data.state.paletteTarget = null
    _data.state.stickerMode = "none"
    _data.state.paletteStickerMenu = false
    _data.react.palette_sheet.setState({enable: false})
    _data.react[cell_id].forceUpdate()
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
        > URLをコピー </button>
      </div>
    )
  }
}

class PaletteDesignMenu extends React.Component {
  constructor(props) {
    super(props)
    this.designList = [
      "design--normal",
      "design--gold",
      "design--silver",
      "design--white",
      "design--dark",
      "design--darkgreen",
      "design--darkblue",
      "design--darkred",
    ]
  }
  setDesign = (e) => {
    let cell_id = _data.state.paletteTarget.match(/^cell_../)
    let role = _data.state.paletteTarget.split("_").pop()
    _data[cell_id][role].design = this.designList[e.currentTarget.dataset.num]
    _data.react[cell_id].forceUpdate()
  }
  render() {
    <div>hoge</div>
    let buttons = []
    this.designList.forEach((d, i) => {
      buttons.push(
        <button
          className={this.designList[i]}
          data-num={i}
          onClick={this.setDesign}
          key={i}
        > {i} </button>
      )
    })
    return (
      <div
        id="palette_design_menu"
      >
        {buttons}
      </div>
    )
  }
}

export default Backboard
