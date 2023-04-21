import React from 'react'
import {Util} from '../logic/util'
import {ToolLogic} from '../logic/tool_logic'

class ToolBox extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    _data.react.toolbox = this
    this.ref = React.createRef()
  }
  render() {
    let readonly = _readonly ? "editable--only" : ""
    return (
      <div id="toolbox">
        <div className={`toolbox--block`}>
          <ToolToggle
            parent={this}
            label="タグ表示"
            hotkey="Ctrl_z"
            logic={ToolLogic.toggleTag}
            tool_id="tool_switch_tag"
            checked={_data.state.showTag}
            key="7"
          />
          <ToolToggle
            parent={this}
            label="ステッカー表示"
            hotkey="Ctrl_x"
            logic={ToolLogic.toggleSticker}
            tool_id="tool_switch_sticker"
            checked={_data.state.showSticker}
            key="8"
          />
          <ToolToggle
            parent={this}
            label="サムネイル表示"
            hotkey="Ctrl_c"
            logic={ToolLogic.toggleThumbnail}
            tool_id="tool_switch_thumbnail"
            checked={_data.state.showThumbnail}
            key="20"
          />
          <ToolButton
            parent={this}
            label="ブック"
            hotkey="Ctrl_g"
            logic={ToolLogic.books}
            tool_id="tool_button_books"
            key="27"
          />
        </div>
        <div className={`toolbox--block`}>
          <ToolToggle
            parent={this}
            label="全体表示"
            hotkey="Ctrl_m"
            logic={ToolLogic.viewLarge}
            tool_id="tool_view_large"
            key="1"
          />
          <ToolToggle
            parent={this}
            label="エリア表示"
            hotkey="Ctrl_n"
            logic={ToolLogic.viewMiddle}
            tool_id="tool_view_middle"
            key="2"
          />
          <ToolToggle
            parent={this}
            label="セル表示"
            hotkey="Ctrl_b"
            logic={ToolLogic.viewSmall}
            tool_id="tool_view_small"
            key="3"
          />
          <ToolToggle
            parent={this}
            label="２in１"
            hotkey="Ctrl_v"
            logic={ToolLogic.viewTwoinone}
            tool_id="tool_view_twoinone"
            key="4"
          />
        </div>
        <div className={`toolbox--block`}>
          <ToolToggle
            parent={this}
            label="全画面表示"
            hotkey="Ctrl_q"
            logic={ToolLogic.toggleFullscreen}
            tool_id="tool_toggle_fullscreen"
            key="6"
          />
          <ToolToggle
            parent={this}
            label="２in１指定"
            hotkey="t"
            logic={ToolLogic.selectModeBind}
            tool_id="tool_toggle_twoinone"
            key="5"
          />
        </div>
        <div className={`toolbox--block ${readonly}`}>
          <ToolToggle
            parent={this}
            label="セル選択"
            hotkey="s"
            logic={ToolLogic.selectModeBind}
            tool_id="tool_toggle_cell"
            key="9"
          />
          <ToolToggle
            parent={this}
            label="エリア選択"
            hotkey="S"
            logic={ToolLogic.selectModeBind}
            tool_id="tool_toggle_area"
            key="10"
          />
          <ToolToggle
            parent={this}
            label="編集"
            hotkey="e"
            logic={ToolLogic.selectModeBind}
            tool_id="tool_toggle_edit"
            key="11"
          />
          <ToolToggle
            parent={this}
            label="削除"
            hotkey="k"
            logic={ToolLogic.selectModeBind}
            tool_id="tool_toggle_erase"
            key="12"
          />
          <ToolToggle
            parent={this}
            label="入替"
            hotkey="l"
            logic={ToolLogic.selectModeBind}
            tool_id="tool_toggle_swap"
            key="13"
          />
        </div>
        <div className={`toolbox--block ${readonly}`}>
          <ToolToggle
            parent={this}
            label="コピー"
            hotkey="c"
            logic={ToolLogic.selectModeBind}
            tool_id="tool_toggle_copy"
            key="15"
          />
          <ToolToggle
            parent={this}
            label="ペースト"
            hotkey="p"
            logic={(e) => {ToolLogic.selectModeBind(e); ToolLogic.paste(e.target.checked, Util.subKeys(e))}}
            tool_id="tool_toggle_paste"
            key="16"
          />
        </div>
        <div className={`toolbox--block ${readonly}`}>
          <ToolToggle
            parent={this}
            label="装飾"
            hotkey="D"
            logic={ToolLogic.selectModeBind}
            tool_id="tool_toggle_design"
            key="23"
          />
          <ToolToggle
            parent={this}
            label="ステッカー"
            hotkey="T"
            logic={ToolLogic.selectModeBind}
            tool_id="tool_toggle_sticker"
            key="24"
          />
          <ToolButton
            parent={this}
            label="修飾合成"
            hotkey="Ctrl_d"
            logic={ToolLogic.union}
            tool_id="tool_button_union"
            key="26"
          />
        </div>
        <div className={`toolbox--block ${readonly}`}>
          <ToolButton
            parent={this}
            label="Undo"
            logic={ToolLogic.undo}
            tool_id="tool_button_undo"
            key="21"
          />
          <ToolButton
            parent={this}
            label="Redo"
            logic={ToolLogic.redo}
            tool_id="tool_button_redo"
            key="22"
          />
          <ToolButton
            parent={this}
            label="History"
            logic={ToolLogic.history}
            tool_id="tool_button_history"
            key="25"
          />
          <ToolButton
            parent={this}
            label="保存"
            logic={ToolLogic.save}
            tool_id="tool_button_save"
            key="18"
          />
        </div>
      </div>
    )
  }
  componentDidMount() {
    ToolLogic.viewModeBind()
  }
  componentWillUnmount() {
  }
}

class ToolButton extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.ref = React.createRef()
    this.id = props.tool_id
    this.label = props.label
    this.hotkey = props.hotkey
    this.logic = props.logic
  }
  render() {
    let label = ""
    if(this.hotkey) {
      label = (<div>{this.label}<br />[{this.hotkey}]</div>)
    } else {
      label = (<div>{this.label}</div>)
    }
    return (
      <button
        className="tool--button"
        id={this.id}
        onClick={this.logic}
        onContextMenu={(e) => { Util.rightClickToLeftClick(e) }}
      >
        {label}
      </button>
    )
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
}

//  ON/OFF状態を持つツール。
//  HTMLのcheckboxを使って実装したが、微妙かもしれない。
//    ・状態をHTML要素で持つことになる（コンポーネントのstateで管理するべきでは）
//    ・HTMLのcheckboxの値をJSで直接更新すると、ReactのonChangeは発火しない。
//  一周作った後、改めて「checkboxじゃない版」作るか検討。
class ToolToggle extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.ref = React.createRef()
    this.id = props.tool_id
    this.label = props.label
    this.hotkey = props.hotkey
    this.logic = props.logic
    this.checked = props.checked || false
  }
  change = (e) => {
    if(this.logic) this.logic(e)
  }
  render() {
    let label = ""
    if(this.hotkey) {
      label = (<div>{this.label}<br />[{this.hotkey}]</div>)
    } else {
      label = (<div>{this.label}</div>)
    }
    return (
      <div
        id={this.id}
        className="tool--toggle"
      >
        <input
          type="checkbox"
          id={`${this.id}_checkbox`}
          className="tool"
          defaultChecked={this.checked}
          onChange={this.change}
        />
        <label
          htmlFor={`${this.id}_checkbox`}
          onContextMenu={(e) => { Util.rightClickToLeftClick(e) }}
        >
          {label}
        </label>
      </div>
    )
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
}

export {ToolBox, ToolButton, ToolToggle}
