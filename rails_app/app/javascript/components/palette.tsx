import React from 'react'
import {Util} from '../logic/util'
import {ToolButton, ToolToggle} from './tool'
import {Sticker} from './cell_sticker'

class PaletteSheet extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "palette_sheet"
    _data.react[this.id] = this
    this.state={enable: null}
  }
  clicked = (e) => {
    //  パレットシートをダブルクリックすると、ダブルクリックが下のセルに通ってしまうのがちょっと気持ち悪い。
    //  stopPropagation, preventDefault では防げない模様。
    this.setState({enable: false},
      () => {
        _data.state.paletteTarget = null
        _data.state.paletteStickerUrl = false
        _data.state.paletteStickerMenu = false
        _data.state.paletteDesignMenu = false
        _data.state.stickerMode = "none"
        _data.state.paletteUnion = false
        Util.releaseSelected("cell")
        let stickers = [...document.getElementsByClassName("sticker--current")]
        stickers.forEach((s) => { _data.react[s.id].setState({current: false}) })
      }
    )
  }
  mouseDowned = (e) => {
    if(_data.state.paletteTarget)
      if(_data.state.stickerMode != "none")
        _data.react[_data.state.paletteTarget].mouseDowned(e)
  }
  mouseMoved = (e) => {
    if(_data.state.paletteTarget)
      if(_data.state.stickerMode != "none")
        _data.react[_data.state.paletteTarget].mouseMoved(e)
  }
  mouseUped = (e) => {
    if(_data.state.paletteTarget)
      if(_data.state.stickerMode != "none")
        _data.react[_data.state.paletteTarget].mouseUped(e)
  }
  render() {
    let classList = []
    if(this.state.enable != null) {
      classList.push(this.state.enable ? "fadeIn" : "fadeOut")
    }
    return(
      <div
        id={this.id}
        className={classList.join(" ")}
        onMouseDown={this.mouseDowned}
        onMouseMove={this.mouseMoved}
        onMouseUp={this.mouseUped}
        onClick={this.clicked}
      >
        <Palette parent={this}/>
      </div>
    )
  }
}

class Palette extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "palette"
    _data.react[this.id] = this
  }
  componentDidMount() {
  }
  componentDidUpdate() {
    //  パレットが画面から溢れないように位置を調整
    let p_rect = document.getElementById(this.id).getBoundingClientRect()
    let screen_rect = document.getElementById("layout_backboard").getBoundingClientRect()
    let left_x = _data.state.palettePoint.left
    let right_x = screen_rect.width - p_rect.width
    let left_y = _data.state.palettePoint.top
    let right_y = screen_rect.height - p_rect.height
    document.getElementById(this.id).style.left = `${Math.min(left_x, right_x)}px`
    document.getElementById(this.id).style.top = `${Math.min(left_y, right_y)}px`
  }
  componentWillUnmount() {
    Util.releaseSelected("cell")
  }
  clicked = (e) => {
    e.stopPropagation()
  }
  render() {
    let classList = ["palette"]
    let type = "_hidden"
    let palette = null
    if(_data.state.paletteStickerUrl) {
      type = "palette--sticker--url"
      palette = (<PaletteStickerUrl/>)
    }
    if(_data.state.paletteStickerMenu) {
      type = "palette--sticker--menu"
      palette = (<PaletteStickerMenu/>)
    }
    if(_data.state.paletteDesignMenu) {
      type = "palette--design--menu"
      palette = (<PaletteDesignMenu/>)
    }
    if(_data.state.paletteUnion) {
      type = "palette--union"
      palette = (<PaletteUnion/>)
    }
    classList.push(type)
    let style = Object.assign({}, _data.state.palettePoint)
    return(
      <div
        id={this.id}
        className={classList.join(" ")}
        style={style}
        onClick={this.clicked}
      >
        {palette}
      </div>
    )
  }
}

class PaletteStickerUrl extends React.Component {
  inputed = (e) => {
    //  インプット幅の自動調整
    let i = e.currentTarget
    let width = i.getBoundingClientRect().width
    let _width = Util.remToPx((i.value.length + 4) / 2)
    i.style.width = `${Math.max(width, _width)}px`

    //  ステッカー作成処理
    //  「作成タイミングの判定」は、仮で「画像URLが入力されたら」とする（よりよい案に直したい）。
    if(i.value.match(/\.(png|jpg|svg|bmp)$/i)) {
      let target = _data.state.paletteTarget
      let cell_id = target.match("^cell_..")
      let type = target.match("[^_]*$")
      let style = Sticker.initialStyle()
      let pr = document.getElementById(_data.state.paletteTarget).getBoundingClientRect()
      let cr = e.currentTarget.closest(".palette").getBoundingClientRect()
      style.left = cr.left - pr.left
      style.top = cr.top - pr.top
      _data[cell_id][type].effect.push({src: i.value, style: style})
      _data.react[cell_id].forceUpdate()
    }
  }
  render() {
    return (
      <div
        id="palette_sticker_url"
      >
        <div>URL:</div>
        <input
          id="palette_sticker_url_input"
          onInput={this.inputed}
        />
      </div>
    )
  }
}

class PaletteStickerMenu extends React.Component {
  _stickerActive = (e) => {
    let sticker = _data.react[_data.state.paletteTarget]
    sticker.setState({current: true})
    _data.state.paletteStickerMenu = false
    _data.react.palette_sheet.forceUpdate()
  }
  move = (e) => {
    //  移動。
    //  クリックしたら画像の見た目が変わる。
    //  ドラッグしたら動く。
    //  外野をクリックしたら解除。
    _data.state.stickerMode = "move"
    this._stickerActive()
  }
  scale = (e) => {
    _data.state.stickerMode = "scale"
    this._stickerActive()
  }
  rotate = (e) => {
    _data.state.stickerMode = "rotate"
    this._stickerActive()
  }
  remove = (e) => {
    //  ステッカーの削除
    let sticker_id = _data.state.paletteTarget
    let cell_id = sticker_id.match(/^cell_../)[0]
    let type = sticker_id.split("_")[3]
    let index = parseInt(sticker_id.split("_")[5])
    //  要素の削除は「データの殻は残し中身を空にする」形をとる。
    //  spliceで要素を除去してみたが、おそらくreactのkey管理の影響で「登録順の最後のステッカーから消えていく」変な挙動になったので、この形で回避した。
    _data[cell_id][type].effect[index].src = ""
    _data[cell_id][type].effect[index].style = ""

    //  パレットを閉じる
    _data.state.paletteTarget = null
    _data.state.stickerMode = "none"
    _data.state.paletteStickerMenu = false
    _data.react.palette_sheet.setState({enable: false})
    _data.react[cell_id].forceUpdate()
  }
  detail = (e) => {
    //  ステッカーのURLをクリップボードにコピーする。
    //  「URL再設定」のUIを作るのが大変なので簡易版で逃げた。
    let sticker_id = _data.state.paletteTarget
    navigator.clipboard.writeText(document.getElementById(sticker_id).src)

    //  パレットを閉じる
    let cell_id = sticker_id.match(/^cell_../)[0]
    _data.state.paletteTarget = null
    _data.state.stickerMode = "none"
    _data.state.paletteStickerMenu = false
    _data.react.palette_sheet.setState({enable: false})
    _data.react[cell_id].forceUpdate()
  }
  render() {
    return (
      <div
        id="palette_sticker_menu"
      >
        <button
          onClick={this.move}
        > 移動 </button>
        <button
          onClick={this.scale}
        > 拡大 </button>
        <button
          onClick={this.rotate}
        > 回転 </button>
        <button
          onClick={this.remove}
        > 削除 </button>
        <button
          onClick={this.detail}
        > URLをコピー </button>
      </div>
    )
  }
}

class PaletteDesignMenu extends React.Component {
  constructor(props) {
    super(props)
    this.designList = "0123456789abcdefghijklmnopqrstuv".split("").map((i) => {return `union--design--${i}`})
  }
  setDesign = (e) => {
    let selected = Util.selectedCellIdWithArea()
    let roles = ["subject", "note"]
    //  選択したセルにデザインを当てる
    selected.forEach((c) => {
      roles.forEach((r) => {
        _data[c][r].design = `union--design--${_data.app_info.design_sort[Util.hexToInt(e.currentTarget.dataset.num)]}`
        _data.react[c].forceUpdate()
      })
    })
    _data.state.paletteDesignMenu = false
    _data.react.palette_sheet.setState({enable: false})
    //  選択対象がセル１件のみだった場合は、選択を自動解除。
    if(1 == selected.length) {
      selected.forEach((c) => {
        _data.react[c].setState({selected: false})
      })
    }
  }
  componentDidMount() {
    document.getElementById("palette").querySelectorAll("button").forEach((b) => { Util.assignUnionDesign(b) })
  }
  componentDidUpdate() {
    document.getElementById("palette").querySelectorAll("button").forEach((b) => { Util.assignUnionDesign(b) })
  }
  render() {
    let buttons = []
    this.designList.forEach((d, i) => {
      buttons.push(
        <button
          className={this.designList[Util.hexToInt(_data.app_info.design_sort[i])]}
          data-num={d.match(/.$/)}
          onClick={this.setDesign}
          key={i}
        > {d.match(/.$/)} </button>
      )
    })
    return (
      <div
        id="palette_design_menu"
      >
        {buttons}
      </div>
    )
  }
}

class PaletteUnion extends React.Component {
  constructor(props) {
    super(props)
    this.design_ids = []
    this.ribbon_style_ids = []
    this.ribbon_color_ids = []
    this.font_style_ids = []
    this.font_color_ids = []
    this.back_ids = []
  }

  //  指定されたチェックボックスを連動させる。（ラジオボタンライク）
  //  イベント発生源（チェックボックス）がtrueだったら、他をfalseにする。
  //  すべてがfalseだった場合、default_check（チェックボックスID）が指定されていたら、それをtrueにする。
  bindingToggles = (e, checkboxes, default_check = false) => {
    if(e.currentTarget.checked) {
      checkboxes.forEach((c) => {
        if(e.currentTarget.id != c)
          document.getElementById(c).checked = false
      })
    } else if(default_check) {
      document.getElementById(default_check).checked = true
    }
  }

  enabled = (ids) => {
    return ids.filter((i) => { return document.getElementById(`${i}_checkbox`).checked})[0] || null
  }

  //  デザインの保存。
  //  指定されたセルの名義で、現在のデザインセットを保存する。
  updateDesign = (current_design_id) => {
    if(!current_design_id) return
    let current      = this.enabled(this.design_ids)
    let ribbon_style = this.enabled(this.ribbon_style_ids)
    let ribbon_color = this.enabled(this.ribbon_color_ids)
    let font_style   = this.enabled(this.font_style_ids)
    let font_color   = this.enabled(this.font_color_ids)
    let back         = this.enabled(this.back_ids)

    _data.app_info.decorates ||= {}
    _data.app_info.decorates[this.idToClass(current_design_id)] = {
      "ribbon_style": this.idToClass(ribbon_style),
      "ribbon_color": this.idToClass(ribbon_color),
      "font_style": this.idToClass(font_style),
      "font_color": this.idToClass(font_color),
      "back":this.idToClass(back) 
    }
    _data.react.map.forceUpdate()
  }

  attachDesign = (current_design_id) => {
    let elm = document.getElementById(current_design_id)
    let classes = _data.app_info.decorates[this.idToClass(current_design_id)]
    if(!classes) return
    elm.classList = `tool--toggle ${Object.values(classes).join(" ").replace(/  */, " ")}`
  }

  //  トグルのidをクラス名に変換する。
  idToClass = (id) => {
    return id ? id.replace(/_/g, "--") : null
  }
  classToId = (classname) => {
    return classname ? classname.replace(/--/g, "_") : null
  }

  //  初期設定。パレット表示後、各トグルに担当のデザインを設定する。
  setClassForUnionPalettes = () => {
    this.ribbon_style_ids.forEach((i) => {this.setClass(i)})
    this.ribbon_color_ids.forEach((i) => {this.setClass(i)})
    this.font_style_ids.forEach((i) => {this.setClass(i)})
    this.font_color_ids.forEach((i) => {this.setClass(i)})
    this.back_ids.forEach((i) => {this.setClass(i)})
  }
  setClass = (id) => {
    document.getElementById(id).classList.add(this.idToClass(id))
  }

  componentDidMount() {
    this.setClassForUnionPalettes()
    this.design_ids.forEach((i) => { this.attachDesign(i) })
    this.disableAll(this.design_ids)
    this.disableAll(this.back_ids)
    this.disableAll(this.font_color_ids)
    this.disableAll(this.font_style_ids)
    this.disableAll(this.ribbon_color_ids)
    this.disableAll(this.ribbon_style_ids)
  }
  componentDidUpdate() {
    this.setClassForUnionPalettes()
    this.design_ids.forEach((i) => { this.attachDesign(i) })
  }

  bindingDesigns = (e) => {
    if(union_operation_0_checkbox.checked) {
      //  入替。この瞬間は入替対象のチェックボックスが２つtrueになっている
      let designs = palette.querySelectorAll("input[id^=union_design_]")
      let checked = [...designs].map((d, i) => {return d.checked ? i : null}).filter((c) => {return c != null})
      if(2 == checked.length) {
        let alt_sort = [..._data.app_info.design_sort]
        let tmp = alt_sort[checked[0]]
        alt_sort[checked[0]] =  alt_sort[checked[1]]
        alt_sort[checked[1]] = tmp
        _data.app_info.design_sort = alt_sort.join("")
        Array(...palette.querySelectorAll("input[id^=union_design_]")).forEach((c) => {c.checked = false})
        this.forceUpdate()
      }
    }

    this.bindingToggles(e, this.design_ids.map((i) => {return `${i}_checkbox`}))
    let classname = this.idToClass(e.currentTarget.closest(".tool--toggle").id)
    let classes = _data.app_info.decorates[classname]
    //  現在のデザインが持つモノだけがアクティブな状態にする
    let back         = classes ? this.classToId(classes.back) : null
    let font_color   = classes ? this.classToId(classes.font_color) : null
    let font_style   = classes ? this.classToId(classes.font_style) : null
    let ribbon_color = classes ? this.classToId(classes.ribbon_color) : null
    let ribbon_style = classes ? this.classToId(classes.ribbon_style) : null

    //  あったら：あったやつがfalseだったらtrueにする
    //  なかったら：関連ぜんぶ落とす
    back         ? this.enableThis(back        ) : this.disableAll(this.back_ids)
    font_color   ? this.enableThis(font_color  ) : this.disableAll(this.font_color_ids)
    font_style   ? this.enableThis(font_style  ) : this.disableAll(this.font_style_ids)
    ribbon_color ? this.enableThis(ribbon_color) : this.disableAll(this.ribbon_color_ids)
    ribbon_style ? this.enableThis(ribbon_style) : this.disableAll(this.ribbon_style_ids)
  }
  enableThis = (id) => {
    let elm = document.getElementById(`${id}_checkbox`)
    if(! elm.checked)
      document.getElementById(id).querySelector("label").click()
  }
  disableAll = (ids) => {
    ids.forEach((id) => {
      if(document.getElementById(`${id}_checkbox`).checked)
        document.getElementById(id).querySelector("label").click()
    })
  }

  bindingRibbonStyles = (e) => {
    let checklist = this.ribbon_style_ids.map((i) => {return `${i}_checkbox`})
    this.bindingToggles(e, checklist, checklist[0])
    this.updateDesign(this.enabled(this.design_ids))
    this.attachDesign(this.enabled(this.design_ids))
  }
  bindingRibbonColors = (e) => {
    let checklist = this.ribbon_color_ids.map((i) => {return `${i}_checkbox`})
    this.bindingToggles(e, checklist, checklist[0])
    this.updateDesign(this.enabled(this.design_ids))
    this.attachDesign(this.enabled(this.design_ids))
  }
  bindingFontStyles = (e) => {
    let checklist = this.font_style_ids.map((i) => {return `${i}_checkbox`})
    this.bindingToggles(e, checklist, checklist[0])
    this.updateDesign(this.enabled(this.design_ids))
    this.attachDesign(this.enabled(this.design_ids))
  }
  bindingFontColors = (e) => {
    let checklist = this.font_color_ids.map((i) => {return `${i}_checkbox`})
    this.bindingToggles(e, checklist, checklist[0])
    this.updateDesign(this.enabled(this.design_ids))
    this.attachDesign(this.enabled(this.design_ids))
  }
  bindingBacks = (e) => {
    let checklist = this.back_ids.map((i) => {return `${i}_checkbox`})
    this.bindingToggles(e, checklist, checklist[0])
    this.updateDesign(this.enabled(this.design_ids))
    this.attachDesign(this.enabled(this.design_ids))
  }

  export = () => {
    let data = {}
    data.decorates = _data.app_info.decorates
    data.design_sort = _data.app_info.design_sort
    navigator.clipboard.writeText(JSON.stringify(data))
  }
  import = () => {
    let j = navigator.clipboard.readText()
    .then((text) => {
      let data = JSON.parse(text)
      Object.keys(data.decorates).forEach((k) => {
        Object.keys(data.decorates[k]).forEach((d) => {
          if(_data.app_info.decorates[k]) {
            if(_data.app_info.decorates[k][d]) {
              _data.app_info.decorates[k][d] = data.decorates[k][d]
            }
          }
        })
      })
      if(_data.app_info.design_sort) _data.app_info.design_sort = data.design_sort
      //  画面の更新
      _data.react.app.forceUpdate()
    })
  }

  render() {
    this.design_ids = []
    this.ribbon_style_ids = []
    this.ribbon_color_ids = []
    this.font_style_ids = []
    this.font_color_ids = []
    this.back_ids = []
    this.operation_ids = []

    let designs_first = []
    "01234567".split("").forEach((i) => {
      let index = Util.hexToInt(i)
      let id = `union_design_${_data.app_info.design_sort[index]}`
      designs_first.push(
        (<ToolToggle
          parent={this}
          label={(<div>012あいう亜意宇<br />abliABLI</div>)}
          logic={this.bindingDesigns}
          tool_id={id}
          checked={false}
          key={_data.app_info.design_sort[index]}
        />)
      )
      this.design_ids.push(id)
    })
    let designs_second = []
    "89abcdef".split("").forEach((i) => {
      let index = Util.hexToInt(i)
      let id = `union_design_${_data.app_info.design_sort[index]}`
      designs_second.push(
        <ToolToggle
          parent={this}
          label={(<div>012あいう亜意宇<br />abliABLI</div>)}
          logic={this.bindingDesigns}
          tool_id={id}
          checked={false}
          key={_data.app_info.design_sort[index]}
        />
      )
      this.design_ids.push(id)
    })
    let designs_third = []
    "ghijklmn".split("").forEach((i) => {
      let index = Util.hexToInt(i)
      let id = `union_design_${_data.app_info.design_sort[index]}`
      designs_third.push(
        <ToolToggle
          parent={this}
          label={(<div>012あいう亜意宇<br />abliABLI</div>)}
          logic={this.bindingDesigns}
          tool_id={id}
          checked={false}
          key={_data.app_info.design_sort[index]}
        />
      )
      this.design_ids.push(id)
    })
    let designs_fourth = []
    "opqrstuv".split("").forEach((i) => {
      let index = Util.hexToInt(i)
      let id = `union_design_${_data.app_info.design_sort[index]}`
      designs_fourth.push(
        <ToolToggle
          parent={this}
          label={(<div>012あいう亜意宇<br />abliABLI</div>)}
          logic={this.bindingDesigns}
          tool_id={id}
          checked={false}
          key={_data.app_info.design_sort[index]}
        />
      )
      this.design_ids.push(id)
    })
    let ribbons = []
    "01234567".split("").map((i) => {
      let id = `union_ribbon_style_${i}`
      ribbons.push(
        <ToolToggle
          parent={this}
          label={""}
          logic={this.bindingRibbonStyles}
          tool_id={id}
          checked={false}
          key={i}
        />
      )
      this.ribbon_style_ids.push(id)
    })
    let ribboncolors = []
    "01234567".split("").map((i) => {
      let id = `union_ribbon_color_${i}`
      ribboncolors.push(
        <ToolToggle
          parent={this}
          label={""}
          logic={this.bindingRibbonColors}
          tool_id={id}
          checked={false}
          key={i}
        />
      )
      this.ribbon_color_ids.push(id)
    })
    let fonts = []
    "01234567".split("").map((i) => {
      let id = `union_font_style_${i}`
      fonts.push(
        <ToolToggle
          parent={this}
          label={(<div>012あいう亜意宇<br />abliABLI</div>)}
          logic={this.bindingFontStyles}
          tool_id={id}
          checked={false}
          key={i}
        />
      )
      this.font_style_ids.push(id)
    })
    let colors = []
    "01234567".split("").map((i) => {
      let id = `union_font_color_${i}`
      colors.push(
        <ToolToggle
          parent={this}
          label={""}
          logic={this.bindingFontColors}
          tool_id={id}
          checked={false}
          key={i}
        />
      )
      this.font_color_ids.push(id)
    })
    let backs = []
    "01234567".split("").map((i) => {
      let id = `union_back_${i}`
      backs.push(
        <ToolToggle
          parent={this}
          label={""}
          logic={this.bindingBacks}
          tool_id={id}
          checked={false}
          key={i}
        />
      )
      this.back_ids.push(id)
    })
    let operations = []
    operations.push(
      <ToolToggle
        parent={this}
        label={"Switch"}
        logic={null}
        tool_id={"union_operation_0"}
        checked={false}
        key={"0"}
      />
    )
    operations.push(
      <ToolButton
        parent={this}
        label={"Export"}
        logic={this.export}
        tool_id={"union_operation_1"}
        key={"1"}
      />
    )
    operations.push(
      <ToolButton
        parent={this}
        label={"Import"}
        logic={this.import}
        tool_id={"union_operation_2"}
        key={"2"}
      />
    )

    return (
      <div
        className="palette--union--wrapper"
      >
        <span>デザイン1</span>
        {designs_first}

        <span>デザイン2</span>
        {designs_second}

        <span>デザイン3</span>
        {designs_third}

        <span>デザイン4</span>
        {designs_fourth}

        <span>リボン型</span>
        {ribbons}

        <span>リボン色</span>
        {ribboncolors}

        <span>フォント</span>
        {fonts}

        <span>フォント色</span>
        {colors}

        <span>背景</span>
        {backs}

        <span>オペレーション</span>
        {operations}
      </div>
    )
  }
}

export {PaletteSheet, Palette, PaletteStickerUrl, PaletteStickerMenu, PaletteDesignMenu, PaletteUnion}

