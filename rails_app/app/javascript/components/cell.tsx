import React from 'react'
import Command from '../logic/command'
import Util from '../logic/util'
import {Map, LargeMap, MiddleMap, SmallMap, Area} from './map'

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
  }
  doubleClicked = (e) => {
    window.data.book.state.currentCell = this.id
  }
  render() {
    let map = Util.closest(this, Map)
    let contents = []
    let area_id = `area_${this.id.match(/(.).$/)[1]}`
    switch(map.state.mode) {
      case "large":
        contents.push(<Editor
          parent={this}
          role="subject"
          source={window.data.page.areas[area_id].cells[this.id].subject}
          key="1"
        />)
        break
      case "middle":
      case "small":
        contents.push(<Editor
          parent={this}
          role="subject"
          source={window.data.page.areas[area_id].cells[this.id].subject}
          key="1"
        />)
        contents.push(<Editor
          parent={this}
          role="note"
          source={window.data.page.areas[area_id].cells[this.id].note}
          key="2"
        />)
        break
    }
    return (
      <div
        ref={this.ref}
        id={this.id}
        className="cell"
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
    Util.toAbs(this.ref.current)
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
        className="tag--cell--id"
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
    contents.push( CellEffect.contentLamp())
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
    this.role = props.role
    this.state = {editable: false}
    this.source = props.source
  }
  click = (e) => {
    this.setState({editable: !this.state.editable})
  }
  render() {
    let content = null
    let className = ""
    switch(this.state.editable) {
      case true:
        content = <EditorData parent={this} />
        className = "editable"
        break
      default:
        content = <EditorDisplay parent={this} />
        className = "readable"
        break
    }
    return (
      <div
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
          className="effect"
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
  }
  change = (e) => {
    this.setState({data: e.target.value})
    this.parent.source.data = e.target.value
    Util.textHeightAdjustment(e)
  }
  blur = (e) => {
    this.parent.setState({editable: false})
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
          className="effect"
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
