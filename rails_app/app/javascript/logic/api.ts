import {Util} from './util'
import axios from 'axios'
//  アプリのAPI一式を定義。
//  データ読み込み／書き込みは _data を直接触る。
class Api {
  static is_synchronizing = false

  static login = (callback = null) => {
    location.href = "/users/sign_in"
  }

  //  ログアウトしたら、なにはともあれページリロード。
  static logout = (callback = null) => {
    axios.delete(`/users/sign_out`)
    .then(() => {
      location.reload()
    })
  }

  static loadBook = (book_id, callback = null) => {
    if(this.is_synchronizing) throw new Error("Already sync now. (Book)");
    this.is_synchronizing = true
    axios.get(`/api/v1/book/${book_id}`)
    .then((data) => {
      let json = JSON.parse(data.data)
      window.data.book = json.book
      window.data.app_info = json.app_info
      _data = dataRefresh()
    })
    .catch(() => {
      location.href = "/404"
    })
    .finally(() => {
      this.is_synchronizing = false
      if(callback) callback()
    })
  }

  static loadPage = (book_id, page_id, callback = null) => {
    if(this.is_synchronizing) throw new Error("Already sync now. (Page)");
    this.is_synchronizing = true
    axios.get(`/api/v1/book/${book_id}/page/${page_id}`)
    .then((data) => {
      window.data.page = JSON.parse(data.data).page
      //  ページを読み直す＝undo履歴をリセットする
      _undo.length = 0
      __undo.length = 0
      _data = dataRefresh()
    })
    .catch(() => {
      location.href = "/404"
    })
    .finally(() => {
      this.is_synchronizing = false
      if(callback) callback()
    })
  }

  //  ユーザーの詳細情報を取得する。ひとまず「自分の情報」に限定。
  static loadUserProperty = (callback = null) => {
    if(this.is_synchronizing) throw new Error("Already sync now. (UserProperty)");
    this.is_synchronizing = true
    axios.get(`/api/v1/user_property`)
    .then((data) => {
      const LENGTH = 16
      let userData = JSON.parse(data.data)
      Object.keys(userData.books).forEach((k) => {
        let list = userData.books[k]
        userData.books[k] = list.splice(0, LENGTH)
        for(let i = userData.books[k].length; i < LENGTH; i++) {
          userData.books[k].push({id: null, name: "<未使用>"})
        }
      })
      window.data.user = userData
      _data = dataRefresh()
    })
    .catch(() => {
    })
    .finally(() => {
      this.is_synchronizing = false
      if(callback) callback()
    })
  }

  static saveBook = (callback = null) => {
    let book_id = Util.urlParams().book
    let payload = {
      name: _data.book.title.data,
      text: JSON.stringify({app_info: _data.app_info, book: _data.book})
    }
    axios.put(`/api/v1/book/${book_id}`, payload)
    .finally(() => {
      if(callback) callback()
    })
  }

  static savePage = (callback = null) => {
    let book_id = Util.urlParams().book
    //  currentPage は絶対ある前提。ない場合はここでnull参照でコケるのが安全。
    let page_id = _data.state.currentPage.match(/.$/)
    let payload = {text: JSON.stringify({page: _data.page})}
    axios.put(`/api/v1/book/${book_id}/page/${page_id}`, payload)
    .finally(() => {
      if(callback) callback()
    })
  }

  static saveUserProperty = (callback = null) => {
    let payload = {text: JSON.stringify(_data.user)}
    axios.put(`/api/v1/user_property`, payload)
    .finally(() => {
      if(callback) callback()
    })
  }
}

export {Api}
