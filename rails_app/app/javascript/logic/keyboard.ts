import {Util} from "./util"
import {ToolLogic} from "./tool_logic"
import {Page} from "../components/page"

//  キー入力処理

//  キー入力は、専用のキューに「ちょっとだけ」履歴を残していく
//    -> 「連続入力する系のHotkey処理」のニーズに楽に対応するため
//    -> 連続性が無効になる入力がきたら、キューをクリアする。
//  キューの形は「新しい履歴が 0」。キューの内容は「キーイベントそのまま」。
class HotkeyQueue {
  static queue = []
  static MAX_LENGTH = 3
  static LEGAL_KEYS = ["Period", "Comma", "KeyW", "KeyE", "KeyR", "KeyS", "KeyD", "KeyF", "KeyZ", "KeyX", "KeyC"]
  static OPTION_KEYS = ["ControlLeft", "ShiftLeft", "AltLeft", "MetaLeft", "MetaRight", "ShiftRight", "Enter", "Backspace"]

  static push = (e) => {
    //  オプションキーのみである場合は、ホットキー入力とはみなさない
    if(! this.OPTION_KEYS.includes(e.code)) {
      this.queue.unshift(e)
      if(this.MAX_LENGTH < this.queue.length) this.queue.pop()
      //  //  記録対象のホットキーでない場合は、キューをリセットする
      //  if(! this.LEGAL_KEYS.includes(e.code)) {
      //    this.clear()
      //  } else {
      //    this.queue.unshift(e)
      //    if(this.MAX_LENGTH < this.queue.length) this.queue.pop()
      //  }
    }
    return this.queue
  }
  static clear = () => {
    this.queue.length = 0
    return this.queue
  }
  static get = () => {
    return this.queue
  }
}

class Keyboard {
  //  キーイベントの「同時押し状態」を判定する。
  static isOnly = (e) => {
   return !(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey)
  }
  static isWithShiftOnly = (e) => {
   return !!(e.shiftKey && !(e.ctrlKey || e.altKey || e.metaKey))
  }
  static isWithCtrlOnly = (e) => {
   return !!(e.ctrlKey && !(e.shiftKey || e.altKey || e.metaKey))
  }
  static isWithAltOnly = (e) => {
   return !!(e.altKey && !(e.ctrlKey || e.shiftKey || e.metaKey))
  }
  static isWithMetaOnly = (e) => {
   return !!(e.metaKey && !(e.ctrlKey || e.shiftKey || e.altKey))
  }

  //  「今、Hotkeyを受け入れて良いか？」
  static hotkey_enable = () => {
    let disables = ["TEXTAREA", "INPUT"]
    return !(disables.includes(document.activeElement.nodeName))
  }

  //  エリア表示ホットキー処理。
  static middleMap = (area_id) => {
    //  現在表示中のエリアを再度指定されたら、エリア表示解除
    if(_data.state.currentArea == area_id && _data.state.viewMode == "middle") {
      document.querySelector("label[for='tool_view_large_checkbox']").click()
      _data.state.hotkeyArea = null
      return
    }
    //  強引な再描画。エリア表示をちらつきで再描画させている。
    _data.state.currentArea = area_id
    document.querySelector("label[for='tool_view_middle_checkbox']").click()
    if(! tool_view_middle_checkbox.checked) {
      document.querySelector("label[for='tool_view_middle_checkbox']").click()
    }
  }
  //  セル表示ホットキー処理。
  static smallMap = (cell_id) => {
    //  現在表示中のセルを再度指定されたら、セル表示解除
    if(_data.state.currentCell == cell_id && _data.state.viewMode == "small") {
      document.querySelector("label[for='tool_view_middle_checkbox']").click()
      _data.state.hotkeyCell = null
      return
    }
    _data.state.currentCell = cell_id
    document.querySelector("label[for='tool_view_small_checkbox']").click()
    if(! tool_view_small_checkbox.checked) {
      document.querySelector("label[for='tool_view_small_checkbox']").click()
    }
  }

  static init = () => {
    window.addEventListener("keydown", (e)=>{
      const keycode = e.keyCode
      const key     = e.key
      const code    = e.code
      const onShift = e.shiftKey
      const onCtrl  = e.ctrlKey
      const onAlt   = e.altKey
      const onMeta  = e.metaKey
      const char    = String.fromCharCode(e.keyCode)
      const ime     = e.isComposing

      //  様々なものの解除
      if(code == "Escape") {
        if("TEXTAREA" == document.activeElement.nodeName) {
          //  テキスト入力状態の解除
          document.activeElement.blur()
        } else if (palette_sheet.classList.contains("fadeIn")) {
          //  パレットを閉じる
          palette_sheet.click()
        } else {
          //  オペレーションを解除する
          //  はりつけ予告も外す
          ToolLogic.disablePasteShadow()
          ToolLogic.releaseToggles()
        }
      }

      //  セル編集時の、サムネイルとノートの切り替え
      if("w" == key && Keyboard.isWithCtrlOnly(e)) {
        let editable = document.getElementsByClassName("editable")[0]
        if(editable) {
          let cell = editable.closest(".cell")
          if(cell) {
            let target = editable.classList.contains("note") ? cell.querySelector(".editor.subject") : cell.querySelector(".editor.note")
            if(target) target.click()
          }
          return
        }
      }

      //  セル編集時、サムネを設定するホットキー
      //  ノートにフォーカス時：サムネの内容を１行に連結して、ノートの先頭に追加。
      //  サムネにフォーカス時：ノートの１行目でサムネの内容を上書き。
      if("y" == key && Keyboard.isWithCtrlOnly(e)) {
        let editable = document.getElementsByClassName("editable")[0]
        if(editable) {
          let cell = editable.closest(".cell")
          if(cell) {
            let id = cell.id
            let current = cell.querySelector(".editor.subject.editable") ? "subject" : "note"
            let textarea = cell.querySelector(".editor.editable textarea")
            if(current == "subject") {
              textarea.value = _data[id].note.data.split("\n")[0]
              //  テキストエリアをJSで編集した場合 changeイベントが発火しないため、直接changed処理をコールしている。
              _data.react[id].subject.editorData.changed(textarea)
            } else {
              textarea.value = _data[id].subject.data + "\n---\n" + textarea.value
              _data.react[id].note.editorData.changed(textarea)
            }
          }
          return
        }
      }

      //  ペースト時の位置調整
      if(("selection--paste" == _data.state.selectionMode) && "wersdfzxc".includes(key)) {
        if("wsz".includes(key)) _data.state.pasteSlideX -= 1
        if("rfc".includes(key)) _data.state.pasteSlideX += 1
        if("wer".includes(key)) _data.state.pasteSlideY -= 1
        if("zxc".includes(key)) _data.state.pasteSlideY += 1
        if("d".includes(key)) _data.state.pasteSlideX = 0
        if("d".includes(key)) _data.state.pasteSlideY = 0
        ToolLogic.disablePasteShadow()
        ToolLogic.paste(tool_toggle_paste_checkbox.checked)
        return
      }

      //  キーをキューに入れる
      //  TODO:精度上げるために「elseならキューをクリアする」を入れるべきでは？
      if(Keyboard.hotkey_enable())  HotkeyQueue.push(e)

      //  ホットキーによるセル／エリア／ページのクリック。
      //  ホットキー履歴を参照する。
      if(Keyboard.hotkey_enable()) {
        //  補助キー無しのキー入力のみを、履歴から抽出。
        let keys = HotkeyQueue.get().map((k) => {return Keyboard.isOnly(k) ? k.key : " "}).join("")
        let codes = HotkeyQueue.get().map((k) => {return k.code})
        let whiches = HotkeyQueue.get().map((k) => {return k.which})
        let arrows = "WERSDFZXC".split("").map((a) => {return `Key${a}`})
        if(arrows.concat("Period").includes(codes[0])) {
          //  セル入力中で、かつセル入力が完了していない場合は、ここで入力を食ってしまう。
          if(keys.includes(".") && "." != keys[2]) return
          if("." == keys[2]) {
            //  動詞が何も指定されていなかったら、暗黙的にセル選択を有効にする。
            if(["selection--none", "selection--areas"].includes(_data.state.selectionMode)) document.querySelector("label[for='tool_toggle_cell_checkbox']").click()
            let cell = codes[0] == "Period" ? _data.state.currentCell.match(/.$/) : String.fromCharCode(whiches[0]).toLowerCase()
            let area = codes[1] == "Period" ? _data.state.currentArea.match(/.$/) : String.fromCharCode(whiches[1]).toLowerCase()
            //  動詞によって、クリック対象を調整。
            let editfor= "large" == _data.state.viewMode ? "_editor_subject" : "_editor_note"
            let editor = ["selection--edit", "selection--design"].includes(_data.state.selectionMode) ? editfor : ""
            let target = document.getElementById(`cell_${area}${cell}${editor}`)
            e.preventDefault()
            if(target) target.dispatchEvent(new MouseEvent("click", {bubbles: true, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey}))
            //  セル入力を処理したら、履歴をクリア。
            HotkeyQueue.clear()
            return
          }
        }
        if(arrows.concat("Comma").includes(codes[0])) {
          //  エリアのクリック。
          if(keys.includes(",") && "," != keys[1]) return
          if("," == keys[1]) {
            if(["selection--none", "selection--cells"].includes(_data.state.selectionMode)) document.querySelector("label[for='tool_toggle_area_checkbox']").click()
            let area = codes[0] == "Comma" ? _data.state.currentArea.match(/.$/) : String.fromCharCode(whiches[0]).toLowerCase()
            let target = document.getElementById(`area_${area}`)
            if(target) target.dispatchEvent(new MouseEvent("click", {bubbles: true, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey}))
            HotkeyQueue.clear()
            return
          }
        }
          //  ページのクリック。
        if("0123456789abcdef".includes(keys[0])) {
          if(keys.includes(";") && ";" != keys[1]) return
          if(";" == keys[1]) {
            document.getElementById(`page_${keys[0]}`).click()
            HotkeyQueue.clear()
            return
          }
        }
      }

      //  編集者／閲覧者どちらでも使えるホットキー。
      if(onCtrl && !ime) {
        switch(code) {
          //  全画面表示
          case "KeyQ": document.querySelector("label[for='tool_toggle_fullscreen_checkbox']").click(); break
          //  タブ表示
          case "KeyZ": document.querySelector("label[for='tool_switch_tag_checkbox']").click(); break
          //  ステッカー
          case "KeyX": document.querySelector("label[for='tool_switch_sticker_checkbox']").click(); break
          //  サムネイル
          case "KeyC": document.querySelector("label[for='tool_switch_thumbnail_checkbox']").click(); break
          //  全体表示
          case "KeyM": document.querySelector("label[for='tool_view_large_checkbox']").click(); break
          //  エリア表示
          case "KeyN": document.querySelector("label[for='tool_view_middle_checkbox']").click(); break
          //  セル表示
          case "KeyB": document.querySelector("label[for='tool_view_small_checkbox']").click(); break
          //  2in1表示
          case "KeyV": document.querySelector("label[for='tool_view_twoinone_checkbox']").click(); break
        }
      }

      //  AltKeyはエリア／セル表示
      //    Alt 押しっぱなしで：
      //      一度ARROWSを押す：エリア表示
      //      もう一度ARROWSを押す：セル表示
      //      スペースを押す：セル->エリア、エリア->全体、へ移動
      if(onAlt) {
        if(code == "Space") {
          if(_data.state.viewMode == "middle") {
            _data.state.hotkeyArea = null
            document.querySelector("label[for='tool_view_large_checkbox']").click()
          }
          if(_data.state.viewMode == "small") {
            _data.state.hotkeyCell = null
            document.querySelector("label[for='tool_view_middle_checkbox']").click()
          }
        }
        if(_data.state.hotkeyArea) {
          switch(code) {
            case "KeyW": _data.state.hotkeyCell = "w"; Keyboard.smallMap(`cell_${_data.state.hotkeyArea}w`); break
            case "KeyE": _data.state.hotkeyCell = "e"; Keyboard.smallMap(`cell_${_data.state.hotkeyArea}e`); break
            case "KeyR": _data.state.hotkeyCell = "r"; Keyboard.smallMap(`cell_${_data.state.hotkeyArea}r`); break
            case "KeyS": _data.state.hotkeyCell = "s"; Keyboard.smallMap(`cell_${_data.state.hotkeyArea}s`); break
            case "KeyD": _data.state.hotkeyCell = "d"; Keyboard.smallMap(`cell_${_data.state.hotkeyArea}d`); break
            case "KeyF": _data.state.hotkeyCell = "f"; Keyboard.smallMap(`cell_${_data.state.hotkeyArea}f`); break
            case "KeyZ": _data.state.hotkeyCell = "z"; Keyboard.smallMap(`cell_${_data.state.hotkeyArea}z`); break
            case "KeyX": _data.state.hotkeyCell = "x"; Keyboard.smallMap(`cell_${_data.state.hotkeyArea}x`); break
            case "KeyC": _data.state.hotkeyCell = "c"; Keyboard.smallMap(`cell_${_data.state.hotkeyArea}c`); break
          }
        } else {
          switch(code) {
            case "KeyW": _data.state.hotkeyArea = "w"; Keyboard.middleMap("area_w"); break
            case "KeyE": _data.state.hotkeyArea = "e"; Keyboard.middleMap("area_e"); break
            case "KeyR": _data.state.hotkeyArea = "r"; Keyboard.middleMap("area_r"); break
            case "KeyS": _data.state.hotkeyArea = "s"; Keyboard.middleMap("area_s"); break
            case "KeyD": _data.state.hotkeyArea = "d"; Keyboard.middleMap("area_d"); break
            case "KeyF": _data.state.hotkeyArea = "f"; Keyboard.middleMap("area_f"); break
            case "KeyZ": _data.state.hotkeyArea = "z"; Keyboard.middleMap("area_z"); break
            case "KeyX": _data.state.hotkeyArea = "x"; Keyboard.middleMap("area_x"); break
            case "KeyC": _data.state.hotkeyArea = "c"; Keyboard.middleMap("area_c"); break
          }
        }
      }

      //  ページ遷移処理
      if(Keyboard.hotkey_enable()) {
        let pages = Page.page_ids.split("").map((p) => {return `page_${p}`})
        if(onCtrl || onAlt) {
          switch(code) {
            //  Ctrl+< : ページを後ろめくり
            case "Comma":
              {
                let index = pages.indexOf(_data.state.currentPage)
                index = (index - 1) < 0 ? pages.length - 1 : index - 1
                let next_page = pages[index]
                document.getElementById(next_page).click()
              }
              break
            //  Ctrl+> : ページを前めくり
            case "Period":
              {
                let index = pages.indexOf(_data.state.currentPage)
                index = (index + 1) % pages.length
                let next_page = pages[index]
                document.getElementById(next_page).click()
              }
              break
          }
        }
      }

      //  ここから下は、編集者モードでなければ利用不可。
      if(! _data.app_info.is_owner) return

      //  修飾パレット表示時のホットキー
      if(_data.state.paletteDesignMenu) {
        if("0123456789abcdefghijklmnopqrstuv".includes(key)) {
          palette_design_menu.querySelector(`[data-num="${key}"]`).click()
        }
      }

      if(Keyboard.hotkey_enable()) {
        //  補助キーでモード調整をするコマンド
        switch(code) {
          case "KeyK":
            //  削除ホットキー
            document.querySelector("label[for='tool_toggle_erase_checkbox']").dispatchEvent(new MouseEvent("click", {bubbles: true, ctrlKey: e.ctrlKey,shiftKey: e.shiftKey, altKey: e.altKey}))
            break
          case "KeyL":
            //  入替ホットキー
            document.querySelector("label[for='tool_toggle_swap_checkbox']").dispatchEvent(new MouseEvent("click", {bubbles: true, ctrlKey: e.ctrlKey,shiftKey: e.shiftKey, altKey: e.altKey}))
            break
          case "KeyP":
            //  ペーストホットキー
            document.querySelector("label[for='tool_toggle_paste_checkbox']").dispatchEvent(new MouseEvent("click", {bubbles: true, ctrlKey: e.ctrlKey,shiftKey: e.shiftKey, altKey: e.altKey}))
            break
        }
        if(! onCtrl) {
          switch(code) {
            case "KeyS":
              //  セル選択／エリア選択ホットキー
              if(onShift) {
                  document.querySelector("label[for='tool_toggle_area_checkbox']").click()
                } else {
                  document.querySelector("label[for='tool_toggle_cell_checkbox']").click()
                }
              break
            case "KeyE":
              //  編集ホットキー
              document.querySelector("label[for='tool_toggle_edit_checkbox']").click()
              break
            case "KeyD":
              if(onShift) {
                //  デザインホットキー
                document.querySelector("label[for='tool_toggle_design_checkbox']").click()
              }
              break
            case "KeyC":
              //  コピーホットキー
              document.querySelector("label[for='tool_toggle_copy_checkbox']").click()
              break
            case "KeyT":
              if(onShift) {
                //  ステッカーホットキー
                document.querySelector("label[for='tool_toggle_sticker_checkbox']").click()
              } else {
                //  2in1ホットキー
                document.querySelector("label[for='tool_toggle_twoinone_checkbox']").click()
              }
              break
          }
        }
        if(Keyboard.isWithCtrlOnly(e)) {
          switch(code) {
            case "KeyD":
                tool_button_union.click()
              break
          }
        }
      }
    })
  }
}

export {Keyboard, HotkeyQueue}
