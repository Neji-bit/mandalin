import parse from 'html-react-parser'

//  雑多な共通処理をまとめて置いておくクラス。
class Util {

  //  textareaの高さを、内容を解釈して調整する
  static textHeightAdjustment = (e) => {
    // textarea要素のpaddingのY軸(高さ)
    const PADDING_Y = 0
    let t = e.currentTarget
    // textarea要素のlineheight
    let lineHeight = getComputedStyle(t).lineHeight
    // "19.6px" のようなピクセル値が返ってくるので、数字だけにする
    lineHeight = lineHeight.replace(/[^-\d\.]/g, '')
    lineHeight = 20
    // textarea要素に入力された値の行数
    const lines = (t.value + '\n').match(/\n/g).length
    // 高さを再計算
    t.style.height = lineHeight * lines + PADDING_Y + 'px'
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
    console.log(elm)
    let rect = Util.abs(elm)
    Object.keys(rect).forEach((key) => {
      elm.style[key] = `${rect[key]}px`
    });
    return elm
  }
}

export default Util
