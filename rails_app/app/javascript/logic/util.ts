import parse from 'html-react-parser'
import {HotkeyQueue} from `./keyboard`

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
}

export {Util}
