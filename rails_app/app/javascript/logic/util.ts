import parse from 'html-react-parser'
import {HotkeyQueue} from `./keyboard`

//  「無効」を示す目印クラス。
class Nil {}

//  雑多な共通処理をまとめて置いておくクラス。
class Util {

  //  対象要素のスタイル設定でテキストを描いた場合の高さを擬似的に計算する。（改行には非対応）
  static textRect = (elm, text) => {
    const ctx = document.createElement('canvas').getContext('2d')
    // 描画対象要素のテキストスタイルを取得し、Canvasに設定する
    const style = getComputedStyle(elm, "")
    ctx.font = `${style.fontSize} ${style.fontFamily}`
    // 幅、高さを取得
    const mesure = ctx.measureText(text)
    const textWidth = mesure.width
    const textHeight = mesure.actualBoundingBoxAscent + mesure.actualBoundingBoxDescent
    return {width: textWidth, height: textHeight}
  }

  //  textareaの高さを、内容を解釈して調整する
  static textHeightAdjustment = (elm) => {
    // textarea要素のpaddingのY軸(高さ)
    const PADDING_Y = 0
    // textarea要素のlineheight
    let lineHeight = getComputedStyle(elm).lineHeight
    // "19.6px" のようなピクセル値が返ってくるので、数字だけにする
    lineHeight = lineHeight.replace(/[^-\d\.]/g, '')
    lineHeight = 24
    // textarea要素に入力された値の行数
    const lines = (elm.value + '\n').match(/\n/g).length
    // 高さを再計算
    elm.style.height = lineHeight * lines + PADDING_Y + 'px'
  }

  //  "HTMLで記載されたテキスト"をHTMLにパースする。
  //  （機能としては準備するが、本来使わないはず。入力されたスクリプトが生きてしまってはダメ）
  static parse(s) {
    //  現状、実態は html-react-parser を通しているだけ。
    return parse(s.replace(/\n/g, '<br>'))
  }

  //  Reactコンポーネント用。currentを基準に、親を探す（clsで指定されたクラスの直近のもの）。
  static closest = (current, cls) => {
    if(!(current && cls)) return null
    let result = current
    while(result) {
      result = result.parent
      if(!result) break
      if(result.constructor === cls) break
    }
    return result
  }

  //  描画されたHTML要素の現在の絶対値を返す。
  static abs = (elm) => {
    let rect = elm.getBoundingClientRect()
    let styles = ["left", "top", "width", "height"]
    let result = {}
    styles.forEach((k) => {
      result[k] = rect[k]
    })
    return result
  }
  //  描画されたHTML要素に、現在の描画位置／サイズを固定にするスタイルを適用する。
  static toAbs = (elm) => {
    let rect = Util.abs(elm)
    Object.keys(rect).forEach((key) => {
      elm.style[key] = `${rect[key]}px`
    });
    return elm
  }

  static urlParams = (url = location.href) => {
    let params = url.split("?")[1] || ""
    let array = params.split("&")
    let result = {}
    array.forEach((p) => {
      let kv = p.split("=")
      if(kv[0]) result[kv[0]] = kv[1] || ""
    })
    return result
  }

  //  選択中のものを一斉に解放する。
  static releaseSelected = (target = "cell") => {
    let selected = [...document.getElementsByClassName(`${target} selected`)]
    selected.forEach((e) => {
      _data.react[e.id].setState({selected: false})
    })
  }

  //  選択されたセルのDOMを返す。
  static selectedCells = () => {
    return [...document.getElementsByClassName("cell selected")]
  }
  //  選択されたエリアのDOMを返す。
  static selectedAreas = () => {
    return [...document.getElementsByClassName("area selected")]
  }
  //  編集中のセル１件のDOMを返す。
  static editingCell = () => {
    let cell = null
    let editable = [...document.getElementsByClassName("editor editable")].shift()
    if(editable) cell = editable.closest(".cell")
    return cell
  }

  //  選択されたセルおよびエリアを対象に、cell_idを返す。
  static selectedCellIdWithArea = () => {
    let cell_ids = []
    Util.selectedCells().forEach((c) => {
      cell_ids.push(c.id)
    })
    Util.selectedAreas().forEach((a) => {
      [...a.getElementsByClassName("cell")].forEach((c) => {
        cell_ids.push(c.id)
      })
    })
    return cell_ids
  }

  static remToPx(rem) {
    return rem * parseFloat(
      getComputedStyle(document.documentElement).fontSize
    )
  }

  static pxToRem(px) {
    return px / parseFloat(
      getComputedStyle(document.documentElement).fontSize
    )
  }

  static intToHex(i) { return "0123456789abcdefghijklmnopqrstuv"[i] }
  static hexToInt(h) { return "0123456789abcdefghijklmnopqrstuv".indexOf(h) }

  static is_readonly() {
    return (!_data.app_info.is_owner) && (_data.book.authorization.is_public)
  }

  static is_login() {
    return (!!_data.app_info.visitor_email)
  }

  //  抽象的なデザインクラスが設定された要素について、具体的なデザインクラスを割り当てる。
  static assignUnionDesign = (elm) => {
    //  デコレーション系のクラスを、一旦すべて取り除く
    let classes = [...elm.classList].filter((c) => {return !c.match(/^union--(font|ribbon|back)/)})
    //  合成クラスを取得する
    let unions = classes.filter((c) => {return c.match(/union--design--./)})
    //  合成クラスから、デコレーション系のクラスを引く
    let details = []
    unions.forEach((u) => {details = [...details, ...(Object.values(_data.app_info.decorates[u]).filter((f) => {return f}))]})
    //  要素のクラスを指定。「元々あるもの」＋「デコレーション系」
    elm.classList = classes.join(" ")
    elm.classList.add(...details)
  }

  //  「Ctrl+Click」したい時用の処理。Ctrl+Clickは「右クリック扱い」になってしまうため、左クリックに置き換える。
  //  「補助キーを押しながらクリック」系のアクション用。
  static rightClickToLeftClick = (e) => {
    if(e.ctrlKey) {
      e.preventDefault()
      e.target.dispatchEvent(new MouseEvent("click", {bubbles: true, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey}))
    }
  }
  //  イベントから補助キー情報を抽出する
  static subKeys = (e) => {
    if(e.ctrlKey != undefined) {
      return {ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey}
    } else {
      //  Reactイベントが情報を直接持っていない場合は、下の層にあるnativeEventが持ってるハズ
      return {ctrlKey: e.nativeEvent.ctrlKey, shiftKey: e.nativeEvent.shiftKey, altKey: e.nativeEvent.altKey}
    }
  }

  //  オブジェクトの属性の値の交換
  //  オブジェクト l と r の キーk の値を交換する
  static swapAttribute = (l, r, k) => {
    let tmp = l[k]
    l[k] = r[k]
    r[k] = tmp
  }

  //  window.data 配下に効率良くアクセスするためのショートカット。
  //  window.data を一次元の連想配列にほぐしたイメージ。
  //  一意特定できない要素（＝keyが重複するケース）は、ショートカットを用意しない。
  static _indexOfHash = (entry = window.data) => {
    let result = {}
    if(entry.constructor !== Object) return result
    //  指定された連想配列を走査
    let keys = Object.keys(entry)
    keys.forEach((k) => {
      //  要素が連想配列であった場合、結果に追加＆再帰。
      if(entry[k] && entry[k].constructor === Object) {
        result[k] = entry[k]
        let sub = this._indexOfHash(result[k])
        let sub_key = Object.keys(sub)
        sub_key.forEach((s) => {
          if(result[s]) {
            result[s] = new Nil()
          } else {
            result[s] = sub[s]
          }
        })
      }
    })
    return result
  }

  //  再帰で作ったショートカット集の仕上げ。
  static indexOfHash = (entry = window.data) => {
    let result = this._indexOfHash(entry)
    //  走査の最初の要素もショートカット集に追加する。
    result["data"] = entry
    //  無効なショートカット（＝一意特定できなかったもの）を除外する。
    Object.keys(result).forEach((k) => {
      if(!result[k] || result[k].constructor === Nil) {
        delete result[k]
      }
    })
    return result
  }
}

class Message {
  static messages = {
    shows: {
      tags: {
        enable: "セルのIDタグの表示を有効にしました。",
        disable: "セルのIDタグの表示を無効にしました。",
      },
      stickers: {
        enable: "ステッカーの表示を有効にしました。",
        disable: "ステッカーの表示を無効にしました。",
      },
      thumbnails: {
        enable: "サムネイルの表示を有効にしました。",
        disable: "サムネイルの表示を無効にしました。",
      }
    },
    views: {
      large: {
        enable: "ビューを「全体表示」に変更しました。",
        disable: null
      },
      middle: {
        enable: "ビューを「エリア表示」に変更しました。",
        disable: null
      },
      small: {
        enable: "ビューを「セル表示」に変更しました。",
        disable: null
      },
      twoinone: {
        enable: "ビューを「2in1表示」に変更しました。",
        disable: null
      },
      fullscreen: {
        enable: "全画面表示を有効にしました。（Ctrl+q で解除）",
        disable:  "全画面表示を無効にしました。"
      }
    },
    actions: {
      copies: {
        enable: "セルをコピーしました",
        disable: null
      },
      twoinoneSelect: {
        determination: "2in1表示の対象セルを指定しました。"
      },
      eraseWithSelected: {
        enable: "セルを削除しました。",
        disable: null
      },
      swapsCell: {
        enable: "セルを入れ替えました。",
        disable: null
      },
      swapsArea: {
        enable: "エリアを入れ替えました。",
        disable: null
      }
    },
    selections: {
      selectionCells: {
        enable: "セルを選択してください。",
        disable: null
      },
      selectionAreas: {
        enable: "エリアを選択してください。",
        disable: null
      },
      selectionEdit: {
        enable: "編集対象のセルを選択してください。",
        disable: null
      },
      selectionErase: {
        enable: "削除対象のセルを選択してください。",
        disable: null
      },
      selectionSwap: {
        enable: "入替対象のセルを２つ選択してください。",
        disable: null
      },
      selectionCopy: {
        enable: "コピー対象のセルを選択してください。",
        disable: null
      },
      selectionPaste: {
        enable: "ペーストの位置を指定してください。",
        disable: null
      },
      selectionTwoinone: {
        enable: "2in1表示の対象セルを選択してください。",
        disable: null
      },
      selectionDesign: {
        enable: "装飾を設定するセルを選択してください。",
        disable: null
      },
      selectionSticker: {
        enable: "ステッカーを貼るセル、またはステッカーを選択してください。",
        disable: null
      },
    },
    palettes: {
      paletteStickers: {
        enable: "ステッカー画像のURLを入力してください。",
        disable: null
      },
      paletteStickerMenu: {
        enable: "ステッカーの調整が可能です。",
        disable: null
      },
      paletteDesign: {
        enable: "装飾を選択してください。",
        disable: null
      },
      paletteUnion: {
        enable: "装飾を合成可能です。",
        disable: null
      },
      paletteBooks: {
        enable: "ブックの管理が可能です。",
        disable: null
      },
    },
    app: {
      book: {
        enable: "ブックを開きました。",
        disable: null
      },
      page: {
        enable: "ページを開きました。",
        disable: null
      },
      publish: {
        enable: "ブックを「公開中」に設定しました。",
        disable: "ブックを「非公開」に設定しました。"
      }
    }
  }
  //  メッセージのショートカット。
  static _messages = Util.indexOfHash(this.messages)

  //  ショートカットからメッセージを探し、返す。
  //  ID: メッセージの一意識別子。
  //  attr: IDで指定したメッセージが属性を持つ場合、それを指定。
  //    "enable", "disable" は true/false による簡易指定が可能。
  static pick(id, attribute = true) {
    let attr = attribute
    if(true == attribute) attr  = "enable"
    if(false == attribute) attr  = "disable"
    let msg = this._messages[id]
    return attr ? msg[attr] : ("string" == typeof msg ? msg : null)
  }

  //  メッセージの表示
  //  arrow:
  //    true: 表示更新時、上方向へアニメーション
  //    false:  表示更新時、下方向へアニメーション
  static add = (text, arrow = true, duration_time = 200) => {
    let animation = arrow ?
      [
        [ {top: "0px"}, {top: "-1.2em"} ],
        [ {top: "1.2em"}, {top: "0px"} ]
      ] : 
      [
        [ {top: "0px"}, {top: "1.2em"} ],
        [ {top: "-1.2em"}, {top: "0px"} ]
      ]

    let anime = message_line.animate(
      animation[0]
    , {
      duration: duration_time
    })
    anime.addEventListener("finish", () => {
      message_line.innerHTML = text
      message.classList.remove("message--active")
      let anime = message_line.animate(
        animation[1]
      , {
        duration: duration_time
      })
      anime.addEventListener("finish", () => {
        message.classList.add("message--active")
      })
    })
  }

  //  add と pick の混合。
  static set = (id, attr = true, arrow = true, duration_time = 200) => {
    let msg = this.pick(id, attr)
    this.add(msg, arrow, duration_time)
  }
}

export {Util, Message}
