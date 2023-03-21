import {Cell} from '../components/cell'

class ToolLogic {
  static viewLarge = (e) => {
    _data.state.viewMode = "large"
    _data.react.map.forceUpdate()
  }
  static viewMiddle = (e) => {
    _data.state.viewMode = "middle"
    _data.react.map.forceUpdate()
  }
  static viewSmall = (e) => {
    _data.state.viewMode = "small"
    _data.react.map.forceUpdate()
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
        ]
      binds.forEach((b) => {
        if(b != e.currentTarget) b.checked = false
      })
    }
    //  選択モードのうち、現在OFFのものについて、選択モードを解除（＝選択していたものを解放）する。
    if(!tool_toggle_cell_checkbox.checked) {
      ToolLogic._releaseSelected("cell")
    }
    if(!tool_toggle_area_checkbox.checked) {
      ToolLogic._releaseSelected("area")
    }
    //  改めて、現在の「選択モード」を特定する。
    let mode = "selection--none"
    if(tool_toggle_cell_checkbox.checked) mode = "selection--cells"
    if(tool_toggle_area_checkbox.checked) mode = "selection--areas"
    if(tool_toggle_edit_checkbox.checked) mode = "selection--edit"
    if(tool_toggle_erase_checkbox.checked) mode = "selection--erase"
    _data.state.selectionMode = mode
    _data.react.map.forceUpdate()
  }
  //  前処理。「動詞を選択された時、すでに選択対象があったらそれらを対象に実行する」アクション。
  static selectModeBindPreAction = (e) => {
    //  削除：選択されているものがある場合は、それらを削除し、ツールはOFFにする。
    if(e.currentTarget.id == "tool_toggle_erase_checkbox") {
      if(0 < [...document.getElementsByClassName("selected")].length) {
        ToolLogic.erase()
        tool_toggle_cell_checkbox.checked = false
        tool_toggle_area_checkbox.checked = false
        tool_toggle_erase_checkbox.checked = false
      }
    }
  }

  //  入れ替え。現在は「選択対象が２つ」の時のみ機能。
  static swap = () => {
    let cells = [...document.getElementsByClassName("cell selected")]
    if(2 == cells.length) {
      ToolLogic._swap(cells[0].id, cells[1].id)
    }
    let areas = [...document.getElementsByClassName("area selected")]
    if(2 == areas.length) {
      let left_cell_id_base = `cell_${areas[0].id.match(/.$/)}`
      let right_cell_id_base = `cell_${areas[1].id.match(/.$/)}`
      Cell.cell_ids.split("").forEach((c) => {
        ToolLogic._swap(`${left_cell_id_base}${c}`, `${right_cell_id_base}${c}`)
      })
    }
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
    let cells = [...document.getElementsByClassName("cell selected")]
    cells.forEach((c) => { ToolLogic.eraseCell(c.id) })
    let areas = [...document.getElementsByClassName("area selected")]
    areas.forEach((a) => {
      Object.keys(_data[a.id].cells).forEach((c) => { ToolLogic.eraseCell(c) })
    })
  }
  static eraseCell = (cell_id) => {
    let data = _data[cell_id]
    data.subject.data = ""
    data.note.data = ""
    _data.react[cell_id].forceUpdate()
  }

  //  選択中のものを一斉に解放する。
  static _releaseSelected = (target = "cell") => {
    let selected = [...document.getElementsByClassName(`${target} selected`)]
    selected.forEach((e) => {
      _data.react[e.id].setState({selected: false})
    })
  }
}

export {ToolLogic}
