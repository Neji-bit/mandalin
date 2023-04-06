import React from 'react'
import {Util} from '../logic/util'
import {Area} from './map'
import {ToolLogic} from '../logic/tool_logic'
import {Editor} from `./cell_editor`

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
    //  セル装飾の場合は、いろいろ特殊。
    //    セル装飾の時は２回目のクリックでも選択を解除しない。
    //    また既に選択されたセルがある場合は、選択しない。
    if("selection--design" == mode) {
      if(! Util.selectedCells().length) {
        this.setState({selected: true})
      }
    }
    if("selection--sticker" == mode) {
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
      case "twoinone":
          ToolLogic.viewSmall()
        break
    }
  }
  render() {
    let contents = []
    let thumbnail = null
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
        thumbnail = (
          <div
            className={`thumbnail--sheet ${_data.state.showThumbnail ? "" : "_hidden"}`}
          >
            <div
              className="thumbnail"
            >
              <Editor
                parent={this}
                id={`${this.id}_editor_subject`}
                role="subject"
                source={_data[area_id].cells[this.id].subject}
                updateTarget={this}
                key="1"
              />
            </div>
          </div>
        )
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
    if(_data.state.currentCell == this.id) classList.push("cell--current")
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
          {thumbnail}
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
  static currentLamp = () => {
    return (
      <div
        className="lamp lamp--cell--current"
        key="5"
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
    contents.push(CellEffect.currentLamp())
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

export {Cell}
