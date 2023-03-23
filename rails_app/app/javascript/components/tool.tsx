import React from 'react'
import Util from '../logic/util'
import {ToolLogic} from '../logic/tool_logic'

class ToolBox extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    _data.react.toolbox = this
    this.ref = React.createRef()
  }
  render() {
    return (
      <div id="toolbox"
      >
        <ToolButton
          parent={this}
          label="全体表示"
          logic={ToolLogic.viewLarge}
          tool_id="tool_view_large"
          key="1"
        />
        <ToolButton
          parent={this}
          label="エリア表示"
          logic={ToolLogic.viewMiddle}
          tool_id="tool_view_middle"
          key="2"
        />
        <ToolButton
          parent={this}
          label="セル表示"
          logic={ToolLogic.viewSmall}
          tool_id="tool_view_small"
          key="3"
        />
        <ToolToggle
          parent={this}
          label="２in１"
          logic={null}
          tool_id="tool_toggle_2in1"
          key="4"
        />

        <ToolButton
          parent={this}
          label="全画面表示"
          logic={ToolLogic.toggleFullscreen}
          tool_id="tool_toggle_fullscreen"
          key="5"
        />
        <div
          key="100"
        />

        <ToolToggle
          parent={this}
          label="タグ表示"
          logic={ToolLogic.toggleTag}
          tool_id="tool_switch_tag"
          checked={true}
          key="6"
        />
        <ToolToggle
          parent={this}
          label="ステッカー表示"
          logic={ToolLogic.toggleSticker}
          tool_id="tool_switch_sticker"
          checked={true}
          key="7"
        />

        <ToolToggle
          parent={this}
          label="セル選択"
          logic={ToolLogic.selectModeBind}
          tool_id="tool_toggle_cell"
          key="8"
        />
        <ToolToggle
          parent={this}
          label="エリア選択"
          logic={ToolLogic.selectModeBind}
          tool_id="tool_toggle_area"
          key="9"
        />
        <ToolToggle
          parent={this}
          label="編集"
          logic={ToolLogic.selectModeBind}
          tool_id="tool_toggle_edit"
          key="10"
        />
        <ToolToggle
          parent={this}
          label="削除"
          logic={ToolLogic.selectModeBind}
          tool_id="tool_toggle_erase"
          key="11"
        />

        <ToolToggle
          parent={this}
          label="入替"
          logic={ToolLogic.selectModeBind}
          tool_id="tool_toggle_swap"
          key="12"
        />
        <div
          key="101"
        />
        <ToolToggle
          parent={this}
          label="コピー"
          logic={ToolLogic.selectModeBind}
          tool_id="tool_toggle_copy"
          key="13"
        />
        <div className="tool" key="14"> ペースト </div>
        <ToolButton
          parent={this}
          label="ブック"
          logic={null}
          tool_id="tool_button_books"
          key="15"
        />
      </div>
    )
  }
  componentDidMount() {
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
    this.logic = props.logic
  }
  render() {
    return (
      <button
        className="tool"
        id={this.id}
        onClick={this.logic}
      >
        {this.label}
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
    this.logic = props.logic
    this.checked = props.checked || false
  }
  change = (e) => {
    if(this.logic) this.logic(e)
  }
  render() {
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
        >
          {this.label}
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
