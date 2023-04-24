import {Cell} from '../components/cell'
import {Api} from '../logic/api'
import {Util, Message} from '../logic/util'

class ToolLogic {
  static viewLarge = (e) => {
    _data.state.viewMode = "large"
    _data.react.map.forceUpdate()
    this.viewModeBind()
  }
  static viewMiddle = (e) => {
    _data.state.viewMode = _data.state.viewMode == "middle" ? "large" : "middle"
    _data.react.map.forceUpdate()
    this.viewModeBind()
  }
  static viewSmall = (e) => {
    _data.state.viewMode = _data.state.viewMode == "small" ? "large" : "small"
    _data.react.map.forceUpdate()
    this.viewModeBind()
  }
  static viewTwoinone = (e) => {
    _data.state.viewMode = _data.state.viewMode == "twoinone" ? "large" : "twoinone"
    _data.react.map.forceUpdate()
    this.viewModeBind()
  }
  static viewModeBind = () => {
    tool_view_large_checkbox.checked = false
    tool_view_middle_checkbox.checked = false
    tool_view_small_checkbox.checked = false
    tool_view_twoinone_checkbox.checked = false

    switch(_data.state.viewMode) {
      case "large":
        tool_view_large_checkbox.checked = true
        Message.set("large")
        break
      case "middle":
        tool_view_middle_checkbox.checked = true
        Message.set("middle")
        break
      case "small":
        tool_view_small_checkbox.checked = true
        Message.set("small")
        break
      case "twoinone":
        tool_view_twoinone_checkbox.checked = true
        Message.set("twoinone")
        break
    }
  }

  static toggleTag = (e) => {
    _data.state.showTag = !_data.state.showTag
    _data.react.map.forceUpdate()
    Message.set("tags", _data.state.showTag)
  }
  static toggleFullscreen = (e) => {
    _data.state.fullscreen = !_data.state.fullscreen
    _data.react.app.forceUpdate()
    Message.set("fullscreen", _data.state.fullscreen)
  }
  static toggleSticker = (e) => {
    _data.state.showSticker = !_data.state.showSticker
    _data.react.map.forceUpdate()
    Message.set("stickers", _data.state.showSticker)
  }
  static toggleThumbnail = (e) => {
    _data.state.showThumbnail = !_data.state.showThumbnail
    _data.react.map.forceUpdate()
    Message.set("thumbnails", _data.state.showThumbnail)
  }

  //  選択トグルをすべて解除する
  static releaseToggles = () => {
    [ tool_toggle_area_checkbox,
      tool_toggle_cell_checkbox,
      tool_toggle_edit_checkbox,
      tool_toggle_erase_checkbox,
      tool_toggle_swap_checkbox,
      tool_toggle_copy_checkbox,
      tool_toggle_paste_checkbox,
      tool_toggle_twoinone_checkbox,
      tool_toggle_design_checkbox,
      tool_toggle_sticker_checkbox
    ].forEach((t) => {if(t.checked) t.click()})
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
        tool_toggle_paste_checkbox,
        tool_toggle_twoinone_checkbox,
        tool_toggle_design_checkbox,
        tool_toggle_sticker_checkbox,
        ]
      binds.forEach((b) => {
        if(b != e.currentTarget) b.checked = false
      })
    }
    //  選択モードのうち、現在OFFのものについて、選択モードを解除（＝選択していたものを解放）する。
    let exemptions = [tool_toggle_design_checkbox]
    if(!((exemptions.filter((e) => {return e.checked})).length)) {
      if(!tool_toggle_cell_checkbox.checked) {
        Util.releaseSelected("cell")
      }
      if(!tool_toggle_area_checkbox.checked) {
        Util.releaseSelected("area")
      }
    }
    //  改めて、現在の「選択モード」を特定する。
    let mode = "selection--none"
    if(tool_toggle_cell_checkbox.checked) mode = "selection--cells"
    if(tool_toggle_area_checkbox.checked) mode = "selection--areas"
    if(tool_toggle_edit_checkbox.checked) mode = "selection--edit"
    if(tool_toggle_erase_checkbox.checked) mode = "selection--erase"
    if(tool_toggle_swap_checkbox.checked) mode = "selection--swap"
    if(tool_toggle_copy_checkbox.checked) mode = "selection--copy"
    if(tool_toggle_paste_checkbox.checked) mode = "selection--paste"
    if(tool_toggle_twoinone_checkbox.checked) mode = "selection--twoinone"
    if(tool_toggle_design_checkbox.checked) mode = "selection--design"
    if(tool_toggle_sticker_checkbox.checked) mode = "selection--sticker"
    _data.state.selectionMode = mode
    _data.react.map.forceUpdate(this.messageWithSelectModeBind)
    _data.react.layout_top.forceUpdate()
    _data.react.layout_right.forceUpdate()

    //  ペーストにまつわる特別処理
    if(tool_toggle_paste_checkbox == e.currentTarget) {
      //  ペースト予告セルのスライド情報を初期化
      _data.state.pasteSlideX = 0
      _data.state.pasteSlideY = 0
    } else {
      //  ペースト以外のコマンドを選択した場合、ペースト予告セルを取り消す。
      //  （ペーストを選択した場合、後続のペースト処理のためにペースト予告セルをそのまま残す）
      ToolLogic.disablePasteShadow()
    }
  }
  //  前処理。「動詞を選択された時、すでに選択対象があったらそれらを対象に実行する」アクション。
  static selectModeBindPreAction = (e) => {
    //  削除：選択されているものがある場合は、それらを削除し、ツールはOFFにする。
    if("tool_toggle_erase_checkbox" == e.currentTarget.id) {
      if(0 < [...document.getElementsByClassName("selected")].length) {
        ToolLogic.erase(Util.subKeys(e))
        //  削除の場合は、ついでに選択を解除する。
        tool_toggle_cell_checkbox.checked = false
        tool_toggle_area_checkbox.checked = false
        tool_toggle_erase_checkbox.checked = false
      }
    }
    //  入替：選択されているものがある場合は、入替し、ツールはOFFにする。
    if("tool_toggle_swap_checkbox" == e.currentTarget.id) {
      if(2 == [...document.getElementsByClassName("selected")].length) {
        ToolLogic.swap(Util.subKeys(e))
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
  //  選択モードを有効にした際に出すメッセージ。
  static messageWithSelectModeBind = () => {
    switch(_data.state.selectionMode) {
      case "selection--cells":
        Message.set("selectionCells")
        break
      case "selection--areas":
        Message.set("selectionAreas")
        break
      case "selection--edit":
        Message.set("selectionEdit")
        break
      case "selection--erase":
        Message.set("selectionErase")
        break
      case "selection--swap":
        Message.set("selectionSwap")
        break
      case "selection--copy":
        Message.set("selectionCopy")
        break
      case "selection--paste":
        Message.set("selectionPaste")
        break
      case "selection--twoinone":
        Message.set("selectionTwoinone")
        break
      case "selection--design":
        Message.set("selectionDesign")
        break
      case "selection--sticker":
        Message.set("selectionSticker")
        break
    }
  }

  //  入れ替え。現在は「選択対象が２つ」の時のみ機能。
  //  入替が成立した際は true, 不成立だった場合は false を返す。
  static swap = (subKeys = {ctrlKey: false, shiftKey: false, altKey: false}) => {
    let cells = [...document.getElementsByClassName("cell selected")]
    if(2 == cells.length) {
      ToolLogic._swap(cells[0].id, cells[1].id, subKeys)
      Message.set("swapsCell")
      return true
    }
    let areas = [...document.getElementsByClassName("area selected")]
    if(2 == areas.length) {
      let left_cell_id_base = `cell_${areas[0].id.match(/.$/)}`
      let right_cell_id_base = `cell_${areas[1].id.match(/.$/)}`
      Cell.cell_ids.split("").forEach((c) => {
        ToolLogic._swap(`${left_cell_id_base}${c}`, `${right_cell_id_base}${c}`, subKeys)
      })
      Message.set("swapsArea")
      return true
    }
    return false
  }
  static _swap = (left_cell_id, right_cell_id, subKeys = {ctrlKey: false, shiftKey: false, altKey: false}) => {
    let left = _data[left_cell_id]
    let right = _data[right_cell_id]
    let tmp = null
    let isPlain = !Object.values(subKeys).find((k) => {return k})

    if(isPlain || subKeys.ctrlKey) {
      tmp = right.subject.data
      right.subject.data = left.subject.data
      left.subject.data = tmp
      tmp = right.note.data
      right.note.data = left.note.data
      left.note.data = tmp
    }
    if(isPlain || subKeys.shiftKey) {
      tmp = right.subject.effect
      right.subject.effect = left.subject.effect
      left.subject.effect = tmp
      tmp = right.note.effect
      right.note.effect = left.note.effect
      left.note.effect = tmp
    }
    if(isPlain || subKeys.altKey) {
      tmp = right.subject.design
      right.subject.design = left.subject.design
      left.subject.design = tmp
      tmp = right.note.design
      right.note.design = left.note.design
      left.note.design = tmp
    }
    _data.react[left_cell_id].forceUpdate()
    _data.react[right_cell_id].forceUpdate()
  }

  //  セル／エリアの削除。
  static erase = (subKeys) => {
    Util.selectedCells().forEach((c) => { ToolLogic.eraseCell(c.id, subKeys) })
    areas = Util.selectedAreas().forEach((a) => {
      Object.keys(_data[a.id].cells).forEach((c) => { ToolLogic.eraseCell(c, subKeys) })
    })
    Message.set("eraseWithSelected")
  }
  static eraseCell = (cell_id, subKeys = {ctrlKey: false, shiftKey: false, altKey: false}) => {
    let isPlain = !Object.values(subKeys).find((k) => {return k})
    let data = _data[cell_id]
    if(isPlain || subKeys.ctrlKey) {
      data.subject.data = ""
      data.note.data = ""
    }
    if(isPlain || subKeys.shiftKey) {
      data.subject.effect = ""
      data.note.effect = ""
    }
    if(isPlain || subKeys.altKey) {
      data.subject.design = ""
      data.note.design = ""
    }
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
    Message.add(`${Message.pick("copies")} （${cell_ids.length}件）`)
  }

  //  仮実装。保存する。
  //  保存は、最終的に自動化し、ボタンは削除する。
  static save = () => {
    Api.saveBook()
    Api.savePage()
    Api.saveUserProperty()
  }

  //  2in1設定。2つ選ばれたセルに、2in1対象のクラスを付与する。
  static twoinone = (left_cell_id = null, right_cell_id = null) => {
    if(!(left_cell_id && right_cell_id)) return false
    _data.state.currentLeftCell = left_cell_id
    _data.state.currentRightCell = right_cell_id
    _data.react.map.refresh()
    Message.set("twoinoneSelect", "determination")
    return true
  }

  //  ペースト。
  //  はりつけ予告セルがまだなければ：予告を出す。
  //  予告がもう出ていれば：はりつけを実行し、予告を解除する。
  //  予告がなく、かつトグルが解除された場合（＝ペーストの途中キャンセル）：なにもしない。
  static paste = (toggle_enabled = false, subKeys = {ctrlKey: false, shiftKey: false, altKey: false}) => {
    navigator.clipboard.readText().then(
      (text) => {
        json = JSON.parse(text)
        if("selection--paste" == _data.state.selectionMode) {
          if(toggle_enabled) {
            ToolLogic.enablePasteShadow(Object.keys(json))
          }
        } else {
          Object.keys(json).forEach((c) => {
            let pasteTo = document.querySelector(`[data-paste-to="${c}"]`)
            if(pasteTo) ToolLogic._copyCell(pasteTo.id, json[c], subKeys)
          })
          ToolLogic.disablePasteShadow()
          _data.react.map.forceUpdate()
        }
      }
    )
  }

  // 配列でID指定されたセルに、ペースト予告デザインを当てる
  static enablePasteShadow = (ids = []) => {
    _data.state.pasteSlideX ||= 0
    _data.state.pasteSlideY ||= 0
    ids.forEach((e) => {
      let elm = _data.react[ToolLogic.getSlideCell(e, _data.state.pasteSlideX, _data.state.pasteSlideY)]
      if(elm) elm.setState({pasteTo: e})
    })
  }
  // ペースト予告デザインを全て解除する
  static disablePasteShadow = () => {
    Object.keys(_data.react).filter((k) => {return k.match(/^cell_..$/)}).forEach((c) => {
      _data.react[c].setState({pasteTo: null})
    })
  }
  //  「指定されたセルをx, yだけずらした位置のセルID」を返す。
  //  ずらした結果、mapからはみ出した場合はnullを返す。
  static getSlideCell = (cell_id, x = 0, y = 0) => {
    let map = [
      ..."ww we wr ew ee er rw re rr".split(" "),
      ..."ws wd wf es ed ef rs rd rf".split(" "),
      ..."wz wx wc ez ex ec rz rx rc".split(" "),
      ..."sw se sr dw de dr fw fe fr".split(" "),
      ..."ss sd sf ds dd df fs fd ff".split(" "),
      ..."sz sx sc dz dx dc fz fx fc".split(" "),
      ..."zw ze zr xw xe xr cw ce cr".split(" "),
      ..."zs zd zf xs xd xf cs cd cf".split(" "),
      ..."zz zx zc xz xx xc cz cx cc".split(" ")
    ]
    let id = cell_id.match(/..$/)[0]
    let index = map.indexOf(id)
    let _x = index % 9
    let _y = Math.floor(index / 9)
    _x += x
    _y += y
    if(_x < 0 || 9 <= _x) return null
    if(_y < 0 || 9 <= _y) return null
    return `cell_${map[_y * 9 + _x]}`
  }

  //  パレットを表示する。
  static paletteSticker = (e) => {
    _data.state.paletteStickerUrl = true
    _data.state.palettePoint.left = e.clientX
    _data.state.palettePoint.top = e.clientY
    _data.react.palette_sheet.setState({enable: true},
      () => {
        _data.state.paletteTarget = e.target.closest(".editor").id
        palette_sticker_url_input.focus()
        palette_sticker_url_input.value = ""
        palette_sticker_url_input.style.width = null
        Message.set("paletteStickers")
      }
    )
  }
  static paletteStickerMenu = (e) => {
    _data.state.paletteStickerMenu = true
    _data.state.palettePoint.left = e.clientX
    _data.state.palettePoint.top = e.clientY
    _data.react.palette_sheet.setState({enable: true},
      () => {
        _data.state.paletteTarget = e.target.id
        Message.set("paletteStickerMenu")
      }
    )
  }
  static paletteDesign = (e) => {
    _data.state.paletteDesignMenu = true
    _data.state.palettePoint.left = e.clientX
    _data.state.palettePoint.top = e.clientY
    _data.react.palette_sheet.setState({enable: true},
      () => {
        _data.state.paletteTarget = e.target.closest(".editor").id
        Message.set("paletteDesign")
      }
    )
  }
  //  Undo履歴を作成する。
  //  「未来の歴史」は削除する。
  //  MAX件を超える場合、溢れた過去分を捨てる。
  static history = (remove_future = true) => {
    let current = JSON.stringify(_data.page.areas)
    //  履歴の内容が「最新の歴史」と一致していた場合、パスする。
    if(_undo.slice(-1)[0] == current) return
    _undo.push(current)
    if(UNDO_MAX < _undo.length) _undo.shift()
    //  「未来の歴史」を削除する。
    if(remove_future) __undo.length = 0
  }
  //  履歴を一つ戻す。
  //  Undo履歴の最新一つを対象とする。
  //    その履歴を「未来の歴史」の最古に移し、それを画面に反映する。
  static undo = (e) => {
    //  まず、現状を歴史に追加する。
    ToolLogic.history(false)
    //  履歴は、最後のひとつは必ず残す。
    if(_undo.length <= 1) return
    //  最新の履歴（＝現在の画面）を「未来の履歴」に移動させる。
    let string = _undo.pop()
    __undo.unshift(string)
    //  最新の履歴を画面に反映。
    ToolLogic._copyCells(JSON.parse(_undo.slice(-1)[0]))
    _data.react.map.forceUpdate()
  }
  //  履歴を一つ進める。
  //  「未来の歴史」の最古を対象とする。
  //    その履歴をUndo履歴の最新に移し、それを画面に反映する。
  static redo = (e) => {
    let string = __undo.shift()
    if(! string) return
    _undo.push(string)
    ToolLogic._copyCells(JSON.parse(string))
    _data.react.map.forceUpdate()
  }

  //  JSONを指定されたセルのデータに上書きする。
  static _copyCell = (cell_id, json, subKeys = {ctrlKey: false, shiftKey: false, altKey: false}) => {
    let isPlain = !Object.values(subKeys).find((k) => {return k})
    Array("subject", "note").forEach((t) => {
      if(isPlain || subKeys.ctrlKey) _data[cell_id][t]["data"] = json[t]["data"]
      if(isPlain || subKeys.shiftKey) _data[cell_id][t]["effect"] = json[t]["effect"]
      if(isPlain || subKeys.altKey) _data[cell_id][t]["design"] = json[t]["design"]
    })
  }
  //  JSON（セル集合）をデータに上書きする。
  //  JSONが{area_w: {}, area_e: {}, ...} である前提。
  static _copyCells = (json) => {
    Object.keys(json).forEach((a) => {
      Object.keys(json[a].cells).forEach((c) => {
        ToolLogic._copyCell(c, json[a].cells[c])
      })
    })
  }
  //  ブックの公開／非公開
  static publish = (json) => {
    _data.authorization.is_public = !_data.authorization.is_public
    Message.set("publish", _data.authorization.is_public)
  }

  static login = () => {
    Api.login()
  }
  static logout = () => {
    Api.logout()
  }

  //  装飾の合成パレットを表示する
  static union = () => {
    _data.state.paletteUnion = true
    _data.react.palette_sheet.setState({enable: true})
    Message.set("paletteUnion")
  }

  //  ブックパレットを表示する
  static books = () => {
    Api.loadUserProperty()
    _data.state.paletteBook = true
    _data.react.palette_sheet.setState({enable: true})
    Message.set("paletteBooks")
  }

  static bookModeBind = (e) => {
    let binds = [
      [tool_switch_book_favorites_checkbox, "booksFavorites"],
      [tool_switch_book_histories_checkbox, "booksHistories"],
      [tool_switch_book_owns_checkbox, "booksOwns"]
    ]
    binds.forEach((c) => {if(e.currentTarget != c[0]) c[0].checked = false})
    if(! binds.find((c) => {return c[0].checked})) {
      binds[0][0].checked = true
    }
    _data.state.bookListType = binds.find((b) => {return b[0].checked})[1]
    _data.react.palette_book_list.forceUpdate(() => {
      document.querySelector(".book--item").click()
    })
  }

  static bookProperties = (book_id) => {
    if(book_id) {
      //  サーバからブック情報を取得
      axios.get(`/api/v1/book/${book_id}`)
      .then((data) => {
        let app_info = JSON.parse(data.data).app_info
        let book = JSON.parse(data.data).book
        _data.state.targetBook.id             = book_id
        _data.state.targetBook.title          = book.title.data || "<タイトル未設定>"
        _data.state.targetBook.owner          = app_info.visitor_email
        _data.state.targetBook.thumbnail      = "/mandalin_icon.svg"
        _data.state.targetBook.authorization  = null
        _data.state.targetBook.tag            = null
        _data.state.targetBook.text           = null
        _data.state.targetBook.lastUpdatedAt  = null
        _data.state.targetBook.createdAt      = null
        //  パレットを再描画
        _data.react.palette.forceUpdate()
        //  お気に入りUIの設定
        tool_toggle_book_favorite_checkbox.checked = book_id && _data.user.books.booksFavorites.find((e) => {return e.id == book_id})
      })
    } else {
      _data.state.targetBook.id             = null
      _data.state.targetBook.title          = "<未使用>"
      _data.state.targetBook.owner          = ""
      _data.state.targetBook.thumbnail      = "/mandalin_icon.svg"
      _data.state.targetBook.authorization  = null
      _data.state.targetBook.tag            = null
      _data.state.targetBook.text           = null
      _data.state.targetBook.lastUpdatedAt  = null
      _data.state.targetBook.createdAt      = null
      //  パレットを再描画
      _data.react.palette.forceUpdate()
      //  お気に入りUIの設定
      tool_toggle_book_favorite_checkbox.checked = book_id && _data.user.books.booksFavorites.find((e) => {return e.id == book_id})
    }
  }

  //  指定されているブックへ遷移する
  //  自分持ちのブックリストを開いている時は、未使用枠を開いた時、新ブックを作成しそれを開く。
  static bookOpen = (e) => {
    let book_id = ToolLogic._targetBookId()
    if(book_id) {
      location.href = `/?book=${book_id}`
    } else if("booksOwns" == _data.state.bookListType) {
      location.href = `/new_book`
    }
  }

  //  ユーザーが持つブック情報の、配列上の順序を入れ替える。
  static bookToUp = (e) => {
    if("booksHistories" == _data.state.bookListType) return
    let down = document.getElementById(_data.state.currentBook)
    let up = down.previousElementSibling
    if(!up) return
    let from = _data.user.books[_data.state.bookListType][Util.hexToInt(down.id.match(/.$/))]
    let to = _data.user.books[_data.state.bookListType][Util.hexToInt(up.id.match(/.$/))]
    //  オブジェクトが参照されている場合、を考慮して、オブジェクトの属性の値単位で交換する。
    Util.swapAttribute(from, to, "id")
    Util.swapAttribute(from, to, "name")
    _data.state.currentBook = up.id
    _data.react.palette.forceUpdate()
  }

  static bookToDown = (e) => {
    if("booksHistories" == _data.state.bookListType) return
    let up = document.getElementById(_data.state.currentBook)
    let down = up.nextElementSibling
    if(!down) return
    let from = _data.user.books[_data.state.bookListType][Util.hexToInt(up.id.match(/.$/))]
    let to = _data.user.books[_data.state.bookListType][Util.hexToInt(down.id.match(/.$/))]
    //  オブジェクトが参照されている場合、を考慮して、オブジェクトの属性の値単位で交換する。
    Util.swapAttribute(from, to, "id")
    Util.swapAttribute(from, to, "name")
    _data.state.currentBook = down.id
    _data.react.palette.forceUpdate()
  }

  //  お気に入り enable/disable
  static bookFavorite = (e) => {
    let list = _data.user.books.booksFavorites
    let book_id = ToolLogic._targetBookId()
    if(! book_id) return
    if(e.currentTarget.checked) {
      //  お気に入りリストに登録する（まだ登録されていない場合）
      if(list.find((e) => {return (e.id == book_id)})) return
      let target = list.find((e) => {return (!e.id)})
      if(!target) return
      target.id = book_id
      target.name = _data.state.targetBook.title
    } else {
      //  お気に入りから削除する
      let alt = list.filter((b) => {return !(!b.id || b.id == book_id)})
      for(let i = 0; i < 16; i++) if(!alt[i]) alt.push({id: null, name: "<未使用>"})
      _data.user.books.booksFavorites = alt
    }
    Api.saveUserProperty()
    _data.react.palette_book_list.forceUpdate(() => {
      //  お気に入りの操作でブックのリストが変動するケースを考慮し、「いま指しているブックをもう一度クリックする」挙動を入れる。
      document.querySelector(".book--item.current--page").click()
    })
  }

  static bookUrlCopy = (e) => {
    let book_id = ToolLogic._targetBookId()
    let url = book_id ? `${location.origin}/?book=${book_id}` : ""
    navigator.clipboard.writeText(url)
  }

  static _targetBookId = () => {
    let book = document.querySelector(".book--property[data-book]")
    if(book) return Number(book.dataset.book)
  }
}

export {ToolLogic}
