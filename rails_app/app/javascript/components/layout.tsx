import React from 'react'
import {Map, LargeMap, MiddleMap, SmallMap, Area} from './map'
import {Page} from './page'
import {ToolBox, ToolButton, ToolToggle} from './tool'
import {IconLogo} from './common'
import {Editor} from './cell_editor'
import {Sticker} from './cell_sticker'
import {Util} from '../logic/util'
import {ToolLogic} from '../logic/tool_logic'
import {PaletteSheet, Palette, PaletteStickerUrl, PaletteStickerMenu, PaletteDesignMenu, PaletteUnion} from './palette'

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
    if(!Util.is_login()) {
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
        <div
          className={_data.state.selectionMode}
        >
          <Editor
            parent={this}
            role="book--title"
            source={_data.book.title}
            key="2"
          />
        </div>
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
    //  ページ名は横幅が長いので、hoverで全表示するようwidthをJSで管理。
    this.width = 0
  }

  componentDidMount() {
    this.width = page_list.getBoundingClientRect().width
    page_list.style.width = `${this.width}px`
  }
  mouseEntered = (e) => {
    //  長い名前を持つページ名があった場合、hover時にスライド表示させる。
    //  初期表示時、ページ枠の寸法（デフォルト値）を保存しておく。
    //  以降、hoverが発生した時、都度「すべてのページ名の長さを図り、最長のものを基準にページ枠をスライド」させる。
    let max_width = Math.max(...[...page_list.querySelectorAll("P")].map((p) => {return Util.textRect(p, p.innerText).width}), 0)
    page_list.style.right = 0
    page_list.style.width = `${Math.max(max_width + 46, this.width)}px`
    page_list.style.position = "absolute"
  }
  mouseLeaved = (e) => {
    page_list.style.width = `${this.width}px`
  }
  render() {
    let contents = []
    Page.page_ids.split("").forEach((i, n) => {
      contents.push(
        <Page
          page_id={`page_${i}`}
          parent={this}
          key={n}
        />)
    })
    return(
      <div id={this.id} className="panel">
        <div
          className="label"
        >
          ページリスト
        </div>
        <div
          id="page_list"
          className="page--list"
          onMouseEnter={this.mouseEntered}
          onMouseLeave={this.mouseLeaved}
        >
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

export {Backboard}
