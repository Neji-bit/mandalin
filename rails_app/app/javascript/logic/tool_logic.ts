import {Cell} from '../components/cell'
import {Api} from '../logic/api'
import {Util} from '../logic/util'

class ToolLogic {
  static viewLarge = (e) => {
    _data.state.viewMode = "large"
    _data.react.map.forceUpdate()
    this.viewModeBind()
  }
  static viewMiddle = (e) => {
    _data.state.viewMode = "middle"
    _data.react.map.forceUpdate()
    this.viewModeBind()
  }
  static viewSmall = (e) => {
    _data.state.viewMode = "small"
    _data.react.map.forceUpdate()
    this.viewModeBind()
  }
  static viewTwoinone = (e) => {
    _data.state.viewMode = "twoinone"
    _data.react.map.forceUpdate()
    this.viewModeBind()
  }
  static viewModeBind = () => {
    tool_view_large_checkbox.checked = _data.state.viewMode == "large"
    tool_view_middle_checkbox.checked = _data.state.viewMode == "middle"
    tool_view_small_checkbox.checked = _data.state.viewMode == "small"
    tool_view_twoinone_checkbox.checked = _data.state.viewMode == "twoinone"
  }

  static toggleTag = (e) => {
    _data.state.showTag = !_data.state.showTag
    _data.react.map.forceUpdate()
  }
  static toggleFullscreen = (e) => {
    _data.state.fullscreen = !_data.state.fullscreen
    _data.react.app.forceUpdate()
  }
  static toggleSticker = (e) => {
    _data.state.showSticker = !_data.state.showSticker
    _data.react.map.forceUpdate()
  }

  //  「選択モード（＝ 択一 or なし）」の連動を管理。
  static selectModeBind = (e) => {
    ToolLogic.selectModeBindPreAction(e)
    if(e.currentTarget.checked) {
      //  いま変化したチェックボックスがONだったら、他のチェックボックスをOFFにする。
      let binds = [
        tool_toggle_area_checkbox,
        tool_toggle_cell_checkbox,
        tool_toggle_edit_checkbox,
        tool_toggle_erase_checkbox,
        tool_toggle_swap_checkbox,
        tool_toggle_copy_checkbox,
        tool_toggle_twoinone_checkbox,
        tool_toggle_design_checkbox,
        tool_toggle_sticker_checkbox,
        ]
      binds.forEach((b) => {
        if(b != e.currentTarget) b.checked = false
      })
    }
    //  選択モードのうち、現在OFFのものについて、選択モードを解除（＝選択していたものを解放）する。
    if(!tool_toggle_cell_checkbox.checked) {
      Util.releaseSelected("cell")
    }
    if(!tool_toggle_area_checkbox.checked) {
      Util.releaseSelected("area")
    }
    //  改めて、現在の「選択モード」を特定する。
    let mode = "selection--none"
    if(tool_toggle_cell_checkbox.checked) mode = "selection--cells"
    if(tool_toggle_area_checkbox.checked) mode = "selection--areas"
    if(tool_toggle_edit_checkbox.checked) mode = "selection--edit"
    if(tool_toggle_erase_checkbox.checked) mode = "selection--erase"
    if(tool_toggle_swap_checkbox.checked) mode = "selection--swap"
    if(tool_toggle_copy_checkbox.checked) mode = "selection--copy"
    if(tool_toggle_twoinone_checkbox.checked) mode = "selection--twoinone"
    if(tool_toggle_design_checkbox.checked) mode = "selection--design"
    if(tool_toggle_sticker_checkbox.checked) mode = "selection--sticker"
    _data.state.selectionMode = mode
    _data.react.map.forceUpdate()
  }
  //  前処理。「動詞を選択された時、すでに選択対象があったらそれらを対象に実行する」アクション。
  static selectModeBindPreAction = (e) => {
    //  削除：選択されているものがある場合は、それらを削除し、ツールはOFFにする。
    if("tool_toggle_erase_checkbox" == e.currentTarget.id) {
      if(0 < [...document.getElementsByClassName("selected")].length) {
        ToolLogic.erase()
        //  削除の場合は、ついでに選択を解除する。
        tool_toggle_cell_checkbox.checked = false
        tool_toggle_area_checkbox.checked = false
        tool_toggle_erase_checkbox.checked = false
      }
    }
    //  入替：選択されているものがある場合は、入替し、ツールはOFFにする。
    if("tool_toggle_swap_checkbox" == e.currentTarget.id) {
      if(2 == [...document.getElementsByClassName("selected")].length) {
        ToolLogic.swap()
        //  入替の場合は、選択を解除しない。
        tool_toggle_swap_checkbox.checked = false
      }
    }
    //  コピー：選択されたものをただクリップボードにコピーするだけ。
    if("tool_toggle_copy_checkbox" == e.currentTarget.id) {
      if(0 < [...document.getElementsByClassName("selected")].length) {
        ToolLogic.copy()
        tool_toggle_copy_checkbox.checked = false
      }
    }
  }

  //  入れ替え。現在は「選択対象が２つ」の時のみ機能。
  //  入替が成立した際は true, 不成立だった場合は false を返す。
  static swap = () => {
    let cells = [...document.getElementsByClassName("cell selected")]
    if(2 == cells.length) {
      ToolLogic._swap(cells[0].id, cells[1].id)
      return true
    }
    let areas = [...document.getElementsByClassName("area selected")]
    if(2 == areas.length) {
      let left_cell_id_base = `cell_${areas[0].id.match(/.$/)}`
      let right_cell_id_base = `cell_${areas[1].id.match(/.$/)}`
      Cell.cell_ids.split("").forEach((c) => {
        ToolLogic._swap(`${left_cell_id_base}${c}`, `${right_cell_id_base}${c}`)
      })
      return true
    }
    return false
  }
  static _swap = (left_cell_id, right_cell_id) => {
    let left = _data[left_cell_id]
    let right = _data[right_cell_id]
    let tmp = null
    tmp = right.subject.data
    right.subject.data = left.subject.data
    left.subject.data = tmp
    tmp = right.note.data
    right.note.data = left.note.data
    left.note.data = tmp
    _data.react[left_cell_id].forceUpdate()
    _data.react[right_cell_id].forceUpdate()
  }

  //  セル／エリアの削除。
  static erase = () => {
    Util.selectedCells().forEach((c) => { ToolLogic.eraseCell(c.id) })
    areas = Util.selectedAreas().forEach((a) => {
      Object.keys(_data[a.id].cells).forEach((c) => { ToolLogic.eraseCell(c) })
    })
  }
  static eraseCell = (cell_id) => {
    let data = _data[cell_id]
    data.subject.data = ""
    data.note.data = ""
    _data.react[cell_id].forceUpdate()
  }

  static copy = () => {
    //  選択対象をセルのリストにする。
    let cell_ids = Util.selectedCells().map((c) => {return c.id})
    Util.selectedAreas().forEach((a) => {
      cell_ids = cell_ids.concat(Object.keys(_data[a.id].cells))
    })

    //  対応するデータをJSON形式で詰め込む。
    //  Stringifyしたものをクリップボードに入れる。
    let json = {}
    cell_ids.forEach((k) => { json[k] = _data[k] })
    navigator.clipboard.writeText(JSON.stringify(json))
  }

  //  仮実装。保存する。
  //  保存は、最終的に自動化し、ボタンは削除する。
  static save = () => {
    Api.saveBook()
    Api.savePage()
  }

  //  2in1設定。2つ選ばれたセルに、2in1対象のクラスを付与する。
  static twoinone = (left_cell_id = null, right_cell_id = null) => {
    if(!(left_cell_id && right_cell_id)) return false
    _data.state.currentLeftCell = left_cell_id
    _data.state.currentRightCell = right_cell_id
    _data.react.map.refresh()
    return true
  }

  static sticker = (cell_id) => {
    console.log(cell_id)
    console.log("Sticker")
    let cell = _data.react[cell_id]
    let subject = _data[cell_id].subject
    let note = _data[cell_id].note
    subject.effect = "http://localhost:3000/mandalin_icon.svg"
    _data.react.map.refresh()
    _data.state.paletteStickerUrl = cell_id
    _data.react.palette.forceUpdate()
  }

  //  パレットを表示する。
  static paletteSticker = (e) => {
    _data.state.palettePoint.left = e.clientX
    _data.state.palettePoint.top = e.clientY
    _data.react.palette_sheet.setState({enable: true},
      () => {
        palette_sticker_url_input.focus()
        palette_sticker_url_input.value = ""
        palette_sticker_url_input.style.width = null
      }
    )
  }
}

export {ToolLogic}
