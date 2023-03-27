import React from 'react'
import Command from '../logic/command'
import {Util} from '../logic/util'
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
    let mode = _data.state.selectionMode
    if("selection--cells" == mode) {
      this.setState({selected: !this.state.selected})
    }
    if("selection--swap" == mode) {
      this.setState({selected: !this.state.selected},
        () => {
          if(ToolLogic.swap()) {
            Util.releaseSelected("cell")
            Util.releaseSelected("area")
          }
        })
    }
    if("selection--copy" == mode) {
      this.setState({selected: !this.state.selected}, ToolLogic.copy)
    }
    if("selection--twoinone" == mode) {
      this.setState({selected: !this.state.selected}, 
        () => {
          let selected = Util.selectedCells().map((c) => {return c.id})
          if(selected.length != 2) return
          //  ひとつめ、ふたつめ、の判定。「自分は必ず２番目で、相方が１番目」。
          let first = null
          let second = null
          if(selected[0] == this.id) {
            second = selected[0]
            first = selected[1]
          } else {
            second = selected[1]
            first = selected[0]
          }
          if(ToolLogic.twoinone(first, second)) {
            Util.releaseSelected("cell")
            _data.state.selectionMode = "selection--none"
            tool_toggle_twoinone_checkbox.checked = false
          }
        })
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
      case "twoinone":
          ToolLogic.viewSmall()
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
      case "twoinone":
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
    let classList = ["cell"]
    if(this.state.selected) classList.push("selected")
    if(_data.state.currentLeftCell == this.id) classList.push("twoinone--left")
    if(_data.state.currentRightCell == this.id) classList.push("twoinone--right")
    return (
      <div
        ref={this.ref}
        id={this.id}
        className={classList.join(" ")}
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
        className="lamp lamp--cell--content"
        key="2"
      >
      </div>
    )
  }
  static twoinoneLeftLamp = () => {
    return (
      <div
        className="lamp lamp--cell--twoinone--left"
        key="3"
      >
      </div>
    )
  }
  static twoinoneRightLamp = () => {
    return (
      <div
        className="lamp lamp--cell--twoinone--right"
        key="4"
      >
      </div>
    )
  }
  render() {
    let contents = []
    contents.push( CellEffect.cellId(this))
    if(_data[this.parent.id].note.data) contents.push(CellEffect.contentLamp())
    contents.push(CellEffect.twoinoneLeftLamp())
    contents.push(CellEffect.twoinoneRightLamp())
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
    if("selection--edit" == _data.state.selectionMode) {
      this.setState({editable: !this.state.editable})
    }
    //  削除モードの場合、サブジェクトとノートが表示されている場合は個々に削除する。
    if(
        ["middle", "small"].includes(_data.state.viewMode) &&
        "selection--erase" == _data.state.selectionMode
    ) {
      if(["subject", "note"].includes(this.role)) {
        _data[this.parent.id][this.role].data = ""
        this.forceUpdate()
      }
    }
    //  ステッカーパレット
    if("selection--sticker" == _data.state.selectionMode) {
      this.setState({selected: !this.state.selected},
      () => { ToolLogic.paletteSticker(e) })
    }
    //  修飾パレット
    if("selection--design" == _data.state.selectionMode) {
      this.setState({selected: !this.state.selected},
      () => { ToolLogic.paletteDesign(e) })
    }
  }
  render() {
    let content = null
    let classList = []
    let cell_id = (this.id || "").match(/^cell_../)
    if(cell_id) classList.push(_data[cell_id][this.role].design)
    switch(this.state.editable) {
      case true:
        content = <EditorData
          parent={this}
          updateTarget={this.updateTarget}
        />
        classList.push("editable")
        break
      default:
        content = <EditorDisplay
          parent={this}
        />
        classList.push("readable")
        break
    }
    return (
      <div
        id={this.id}
        className={`editor ${this.role} ${classList.join(" ")}`}
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
    let effect = []
    if(this.parent.source.effect.length) {
      this.parent.source.effect.forEach((s, i) => {
        if(s.src.length == 0) return
        effect.push(
          <Sticker
            parent={this}
            id={`${this.parent.id}_sticker_${i}`}
            src={s.src}
            style={s.style}
            key={i}
          />
        )
      })
    }
    return (
      <div className="wrapper">
        <div
          className={`effect ${_data.state.showSticker ? "" : "_hidden_sticker"}`}
        >
          {effect}
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
        />
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

class Sticker extends React.Component {
  constructor(props) {
    super(props)
    this.id = props.id
    this.parent = props.parent
    this.state = {
      current: false,
      drag: false,
      scale: false,
      rotate: false
    }
    this.src = this.props.src
    this.style = this.props.style
    this.ref = React.createRef()
    _data.react[this.id] = this
  }
  static initialStyle = () => {
    let style = {}
    style.position = "absolute"
    style.height = "20%"
    style.top = "0%"
    style.left = "0%"
    style.transform = "rotate(0deg)"
    return style
  }
  //  ある値を、範囲の中に収まるように調整する
  _adjustPoint = (point = 0, min = 0, max = 255) => {
    if(point < min) return min
    if(max < point) return max
    return point
  }
  //  エディタ上でのステッカー移動用。
  //  エディタ範囲内で、ステッカーの中心がカーソル位置に当たるように位置調整する。
  _moveCenterToCursor = (e) => {
    let pr = this.ref.current.parentNode.getBoundingClientRect()
    let r = this.ref.current.getBoundingClientRect()
    let x = e.clientX - pr.left - (r.width / 2)
    let y = e.clientY - pr.top - (r.height / 2)
    x = this._adjustPoint(
          e.clientX,
          pr.left + r.width / 2,
          pr.right - r.width / 2)
    y = this._adjustPoint(
          e.clientY,
          pr.top + r.height / 2,
          pr.bottom - r.height / 2)
    this.style.left = `${Math.floor(((x - pr.left - r.width / 2) * 10000 / pr.width)) / 100}%`
    this.style.top = `${Math.floor(((y - pr.top - r.height / 2) * 10000 / pr.height)) / 100}%`
    this.forceUpdate()
  }
  _scale = (e) => {
    //  ステッカーのサイズ調整
    //  カーソルが、ステッカーの左上から縦に離れるほど大きくなる
    let pr = this.ref.current.parentNode.getBoundingClientRect()
    let r = this.ref.current.getBoundingClientRect()
    this.style.height = `${(Math.floor(Math.abs(r.top - e.clientY) * 10000 / pr.height)) / 100}%`
    console.log(this.style.height)
    this.forceUpdate()
  }
  _rotate = (e) => {
    //  ステッカーの回転
    //  カーソルが、ステッカーの中央から右に離れるほど回転する
    let r = this.ref.current.getBoundingClientRect()
    let c = r.left + r.width / 2
    let d = Math.floor(e.clientX - c)
    if(d < 0) d = 0
    console.log(d)
    this.style.transform = `rotate(${d % 360}deg)`
    this.forceUpdate()
  }
  clicked = (e) => {
    //  ステッカーパレット
    if("selection--sticker" == _data.state.selectionMode) {
      this.setState({selected: !this.state.selected},
      () => { ToolLogic.paletteStickerMenu(e) })
    }
    e.preventDefault()
    e.stopPropagation()
  }
  mouseDowned = (e) => {
    if(_data.state.stickerMode == "move") {
      this.setState({drag: true})
      this._moveCenterToCursor(e)
    }
    if(_data.state.stickerMode == "scale") {
      this.setState({scale: true})
    }
    if(_data.state.stickerMode == "rotate") {
      this.setState({rotate: true})
    }
  }
  mouseMoved = (e) => {
    if(this.state.drag) this._moveCenterToCursor(e)
    if(this.state.scale) this._scale(e)
    if(this.state.rotate) this._rotate(e)
  }
  mouseOuted = (e) => {
    if(this.state.drag) this.setState({drag: false})
    if(this.state.scale) this.setState({scale: false})
    if(this.state.rotate) this.setState({rotate: false})
  }
  mouseUped = (e) => {
    if(this.state.drag) this.setState({drag: false})
    if(this.state.scale) this.setState({scale: false})
    if(this.state.rotate) this.setState({rotate: false})
  }
  render() {
    let classList = []
    if(this.state.drag) classList.push("sticker--drag")
    if(this.state.current) classList.push("sticker--current")
    return (
      <img
        id={this.id}
        ref={this.ref}
        onMouseDown={this.mouseDowned}
        onMouseMove={this.mouseMoved}
        onMouseOut={this.mouseOuted}
        onMouseUp={this.mouseUped}
        onClick={this.clicked}
        src={this.src}
        className={classList.join(" ")}
        style={Object.assign({}, this.style)}
        draggable="false"
      />
    )
  }
}

////////////////////////////////////////////////////////////////////////////////

export {Cell, Editor, Sticker}
