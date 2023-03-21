import React from 'react'
import Command from '../logic/command'
import Util from '../logic/util'
import {Map, LargeMap, MiddleMap, SmallMap, Area} from './map'
import {ToolLogic} from '../logic/tool_logic'

import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

////////////////////////////////////////////////////////////////////////////////
//  セル
class Cell extends React.Component {
  static cell_ids = "wersdfzxc"
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.ref = React.createRef()
    this.id = `cell_${this.props.area_id}${this.props.cell_id || ""}`
    _data.react[this.id] = this
    this.state = {selected: false}
  }
  clicked = (e) => {
    if(_data.state.selectionMode == "selection--cells") {
      this.setState({selected: !this.state.selected})
    }
    //  大マップの時は、eraseでセブジェクトもノートもまとめて削除する
    if(_data.state.viewMode == "large" && _data.state.selectionMode == "selection--erase") {
      ToolLogic.eraseCell(this.id)
    }
  }
  doubleClicked = (e) => {
    _data.state.currentCell = this.id
    switch(_data.state.viewMode) {
      case "large":
          ToolLogic.viewMiddle()
        break
      case "middle":
          ToolLogic.viewSmall()
        break
      case "small":
          ToolLogic.viewLarge()
        break
    }
  }
  render() {
    let contents = []
    let area_id = `area_${this.id.match(/(.).$/)[1]}`
    switch(_data.state.viewMode) {
      case "large":
        contents.push(<Editor
          parent={this}
          id={`${this.id}_editor_subject`}
          role="subject"
          source={_data[area_id].cells[this.id].subject}
          updateTarget={this}
          key="1"
        />)
        break
      case "middle":
      case "small":
        contents.push(<Editor
          parent={this}
          id={`${this.id}_editor_subject`}
          role="subject"
          source={_data[area_id].cells[this.id].subject}
          updateTarget={this}
          key="1"
        />)
        contents.push(<Editor
          parent={this}
          id={`${this.id}_editor_note`}
          role="note"
          source={_data[area_id].cells[this.id].note}
          updateTarget={this}
          key="2"
        />)
        break
    }
    return (
      <div
        ref={this.ref}
        id={this.id}
        className={`cell ${this.state.selected ? "selected" : ""}`}
        onClick={this.clicked}
        onDoubleClick={this.doubleClicked}
      >
        <CellEffect parent={this} />
        <div className="wrapper">
          {contents}
        </div>
      </div>
    )
  }
  componentDidMount() {
    //  セルのサイズを固定化。
    //  これをしないと（＝height=auto）、内容物が特大になるとセルの大きさが変動してしまう。
//    Util.toAbs(this.ref.current)
  }
  componentWillUnmount() {
  }
}

class CellEffect extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.ref = React.createRef()
  }
  static cellId = (obj) => {
    return (
      <div
        className={`tag--cell--id ${_data.state.showTag ? "" : "_hidden"}`}
        key="1"
      >
        {obj.parent.id.match(/..$/)}
      </div>
    )
  }
  static contentLamp = () => {
    return (
      <div
        className="tag--cell--content"
        key="2"
      >
      </div>
    )
  }
  render() {
    let contents = []
    contents.push( CellEffect.cellId(this))
    if(_data[this.parent.id].note.data) {
      contents.push( CellEffect.contentLamp())
    }
    return (
      <div
        ref={this.ref}
        className="effect"
      >
        {contents}
      </div>
    )
  }
}

////////////////////////////////////////////////////////////////////////////////
//  サブジェクト ＆ ノート
//  機能的には一緒なので「エディタ」として統一する

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = props.id
    this.role = props.role
    this.state = {editable: false}
    this.source = props.source
    //  このエディタでデータが更新された際に再描画するコンポーネント。
    //  実際はEditorDataのblurで参照され、強制的に再描画される。
    this.updateTarget = props.updateTarget
  }
  click = (e) => {
    if(_data.state.selectionMode == "selection--edit") {
      this.setState({editable: !this.state.editable})
    }
    //  削除モードの場合、サブジェクトとノートが表示されている場合は個々に削除する。
    if(
        ["middle", "small"].includes(_data.state.viewMode) &&
        _data.state.selectionMode == "selection--erase"
    ) {
      if(["subject", "note"].includes(this.role)) {
        _data[this.parent.id][this.role].data = ""
        this.forceUpdate()
      }
    }
  }
  render() {
    let content = null
    let className = ""
    switch(this.state.editable) {
      case true:
        content = <EditorData
          parent={this}
          updateTarget={this.updateTarget}
        />
        className = "editable"
        break
      default:
        content = <EditorDisplay
          parent={this}
        />
        className = "readable"
        break
    }
    return (
      <div
        id={this.id}
        className={`editor ${this.role} ${className}`}
        onClick={this.click}
      >
        {content}
    </div>)
  }
}

class EditorDisplay extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
  }
  render() {
    let content = ""
    try { content = this.parent.source.data } catch(e) { content = "Now loading..." }
    return (
      <div className="wrapper">
        <div
          className={`effect ${_data.state.showSticker ? "" : "_hidden_sticker"}`}
        >
          <div
            className="テスト。このdivをクリックした時は、下には透過しない。"
            style={{position: "absolute", width: "10px", height: "10px", background: "green", right: "5px", bottom: "5px"}}
            onClick={(e) => {e.stopPropagation()}}
          />
        </div>
        <ReactMarkdown className="display"
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          remarkPlugins={[remarkGfm]}
          linkTarget={"_blank"}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }
}

class EditorData extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.state = {data: ""}
    this.ref = React.createRef()
    try { this.state.data = this.parent.source.data } catch(e) { this.state.data = "Now loading..." }
    this.updateTarget = props.updateTarget
  }
  change = (e) => {
    this.setState({data: e.target.value})
    this.parent.source.data = e.target.value
    Util.textHeightAdjustment(e)
  }
  blur = (e) => {
    this.parent.setState({editable: false})
    if(this.updateTarget) this.updateTarget.forceUpdate()
  }
  focus = (e) => {
    Util.textHeightAdjustment(e)
  }
  componentDidMount() {
    this.ref.current.focus()
  }
  render() {
    return (
      <div className="wrapper middle">
        <div
          className={`effect ${_data.state.showSticker ? "" : "_hidden_sticker"}`}
        >
          <div
            className="テスト。このdivをクリックした時は、下には透過しない。"
            style={{position: "absolute", width: "10px", height: "10px", background: "green", right: "5px", bottom: "5px"}}
            onClick={(e) => {e.stopPropagation()}}
          />
        </div>
        <textarea
          ref={this.ref}
          className="data"
          rows="1"
          spellCheck="false"
          wrap="off"
          value={this.state.data}
          onChange={this.change}
          onBlur={this.blur}
          onFocus={this.focus}
        />
      </div>
    )
  }
}

////////////////////////////////////////////////////////////////////////////////

export {Cell, Editor}
