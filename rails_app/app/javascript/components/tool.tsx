import React from 'react'
import Util from '../logic/util'
import {ToolLogic} from '../logic/tool_logic'

class ToolBox extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.ref = React.createRef()
  }
  render() {
    return (
      <div id="toolbox"
      >
        <Tool
          parent={this}
          label="全体表示"
          logic={ToolLogic.viewLarge}
          tool_id="tool_view_large"
          key="1"
        />
        <Tool
          parent={this}
          label="エリア表示"
          logic={ToolLogic.viewMiddle}
          tool_id="tool_view_middle"
          key="2"
        />
        <Tool
          parent={this}
          label="セル表示"
          logic={ToolLogic.viewSmall}
          tool_id="tool_view_small"
          key="3"
        />
        <Tool
          parent={this}
          label="全画面表示"
          logic={ToolLogic.toggleFullscreen}
          tool_id="tool_toggle_fullscreen"
          key="4"
        />

        <Tool
          parent={this}
          label="タグ表示"
          logic={ToolLogic.toggleTag}
          tool_id="tool_toggle_tag"
          key="5"
        />
        <Tool
          parent={this}
          label="ステッカー表示"
          logic={ToolLogic.toggleSticker}
          tool_id="tool_toggle_sticker"
          key="6"
        />
        <div className="tool" key="7"> セル／エリア </div>
        <div className="tool" key="8"> </div>

        <div className="tool" key="9"> 選択 </div>
        <div className="tool" key="10"> 入替 </div>
        <div className="tool" key="11"> コピー </div>
        <div className="tool" key="12"> ペースト </div>
        <div className="tool" key="13"> 削除 </div>
      </div>
    )
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
}

class Tool extends React.Component {
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

class Toggle extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.ref = React.createRef()
    this.id = props.page_id
  }
  render() {
    return (
      <div> </div>
    )
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
}

export {ToolBox, Tool, Toggle}
