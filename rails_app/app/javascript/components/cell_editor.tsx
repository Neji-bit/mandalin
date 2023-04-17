import React from 'react'
import {Util} from '../logic/util'
import {ToolLogic} from '../logic/tool_logic'
import {Sticker} from `./cell_sticker`

import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

////////////////////////////////////////////////////////////////////////////////
//  サブジェクト ＆ ノート
//  機能的には一緒なので「エディタ」として統一する

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = props.id
    this.role = props.role
    this.parent[this.role] = this
    this.state = {editable: false}
    this.source = props.source
    //  このエディタでデータが更新された際に再描画するコンポーネント。
    //  実際はEditorDataのblurで参照され、強制的に再描画される。
    this.updateTarget = props.updateTarget
  }
  doubleClicked = (e) => {
    if("selection--edit" == _data.state.selectionMode) {
      this.setState({editable: false})
    }
  }
  clicked = (e) => {
    if("selection--edit" == _data.state.selectionMode) {
      this.setState({editable: true})
    }

    //  ブックタイトル、ページタイトルの時は、これ以降は処理しない。
    if("page--title" == this.role) return
    if("book--title" == this.role) return

    //  //  削除モードの場合、サブジェクトとノートが表示されている場合は個々に削除する。
    //  if(
    //      ["middle", "small"].includes(_data.state.viewMode) &&
    //      "selection--erase" == _data.state.selectionMode
    //  ) {
    //    if(["subject", "note"].includes(this.role)) {
    //      _data[this.parent.id][this.role].data = ""
    //      this.forceUpdate()
    //    }
    //  }

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
        onClick={this.clicked}
        onDoubleClick={this.doubleClicked}
      >
        {content}
      </div>)
  }
  componentDidMount() {
    let elm = document.getElementById(this.id)
    if(elm) Util.assignUnionDesign(elm)
  }
  componentDidUpdate() {
    let elm = document.getElementById(this.id)
    if(elm) Util.assignUnionDesign(elm)
  }
}

class EditorDisplay extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.parent.editorDisplay = this
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
    this.parent.editorData = this
  }
  changed = (e) => {
    let elm = e instanceof HTMLElement ? e : e.target
    this.setState({data: elm.value})
    this.parent.source.data = elm.value
    Util.textHeightAdjustment(elm)
  }
  blur = (e) => {
    //  エディタで編集中にMandalinのブラウザを隠した時は、フォーカスを外さない。（＝ブラウザ復帰時、編集状態が維持される）
    //  （この書き方で「blurが発生した理由が、テキストエリア以外をクリックしたわけではない」が判定できる）
    if("TEXTAREA" == document.activeElement.nodeName) return

    this.parent.setState({editable: false})
    if(this.updateTarget) this.updateTarget.forceUpdate()
  }
  focus = (e) => {
    Util.textHeightAdjustment(e.target)
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
          onChange={this.changed}
          onBlur={this.blur}
          onFocus={this.focus}
        />
      </div>
    )
  }
}

export {Editor}
