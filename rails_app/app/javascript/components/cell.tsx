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
  }
  render() {
    let map = Util.closest(this, Map)
    let contents = []
    switch(map.state.mode) {
      case "large":
        contents.push(<Editor parent={this} role="subject" key="1" />)
        break
      case "middle":
      case "small":
        contents.push(<Editor parent={this} role="subject" key="1" />)
        contents.push(<Editor parent={this} role="note" key="2" />)
        break
    }
    return (
      <div
        ref={this.ref}
        id={`cell_${this.props.area_id}${this.props.cell_id || ""}`}
        className="cell"
      >
        {contents}
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

////////////////////////////////////////////////////////////////////////////////
//  サブジェクト ＆ ノート
//  機能的には一緒なので「エディタ」として統一する

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.role = props.role
    this.state = {editable: false}
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
        onClick={this.click.bind(this)}
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
    return (
      <ReactMarkdown className="display"
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        linkTarget={"_blank"}
      >
        {window.data.text}
      </ReactMarkdown>
    )
  }
}

class EditorData extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.state = {data: window.data.text}
    this.ref = React.createRef()
  }
  change = (e) => {
    this.setState({data: e.target.value})
    window.data.text = e.target.value
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
    )
  }
}

////////////////////////////////////////////////////////////////////////////////

export {Cell, Editor}
